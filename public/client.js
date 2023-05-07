const clickButton = document.getElementById("click-button");
const data = document.getElementById("click-count");
const signupForm = document.getElementById("signup-form");
const loginForm = document.querySelector("#loginModal form");
const googleSignInButton = document.getElementById("google-signin");
const forgotPasswordLink = document.getElementById("forgot-password-link");
 const greeting = document.getElementById('greeting');

 const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)


if (loginForm) {

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = event.target[0].value;
    const password = event.target[1].value;
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const idToken = await userCredential.user.getIdToken();

    } catch (error) {

      console.error("Login error:", error);
    }
  });
}


if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const firstName = event.target["first-name"].value;
    const lastName = event.target["last-name"].value;
    const email = event.target["new-email"].value;
    const password = event.target["new-password"].value;

    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({
        displayName: `${firstName} ${lastName}`,
      });
      await userCredential.user.sendEmailVerification();

    } catch (error) {
      alert(error.message);
    }
  });
}

const userEmail = sessionStorage.getItem('user');
if (greeting) {
  const username = userEmail;
  greeting.textContent = `Hello, ${username}`;
}

async function signOuts() {
  await firebase.auth().signOut();
}



  if (googleSignInButton) {
    googleSignInButton.addEventListener("click", signInWithGoogle);
    
  }
  
  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
  
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;
    
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  }
  
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", async (event) => {
    event.preventDefault();
    const email = prompt("Please enter your registered email address:");

    if (email) {
      try {
        await firebase.auth().sendPasswordResetEmail(email);
        alert("Password reset email sent. Please check your inbox.");
      } catch (error) {
        console.error("Error sending password reset email:", error);
        alert("Failed to send password reset email. Please try again.");
      }
    }
  });
}

  
  
  // redirects user to login page if they are not logged in and vise versa
  firebase.auth().onAuthStateChanged(async (user) => {
  if (!user && window.location.pathname === '/Celeb-Talk') {
      history.replaceState(null, document.title, "/");
      window.location.href = '/';
    }
    if (user && window.location.pathname !== '/Celeb-Talk' && user.emailVerified) {
      history.replaceState(null, document.title, "/Celeb-Talk");
      window.location.href = '/Celeb-Talk';
    }
  });





  // ALL database related functions
  async function addToDatabase(user) {
    const userId = user.uid;
  
    // Create a new object with the necessary properties
    const userInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  
    const userRef = firebase.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();
  
    if (!userDoc.exists) {
      const response = await fetch("/createUser", {
        method: "POST",
        // Use the new userInfo object instead of the whole user object
        body: JSON.stringify({ userInfo }),
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.ok) {
        console.log("User created successfully");
        const userData = await response.json();
        return userData;
      } else {
        console.error("User creation failed");
      }
    } else {
      return userDoc.data();
    }
  }



  async function updateClicks(userId, newClicks) {
    const response = await fetch("/updateClicks", {
      method: "POST",
      body: JSON.stringify({ userId, clicks: newClicks }),
      headers: { "Content-Type": "application/json" },
    });
  
    if (response.ok) {
      console.log("Clicks updated successfully");
    } else {
      console.error("Clicks update failed");
    }
  }
  
// updates the click count once the user is logged in and verified
firebase.auth().onAuthStateChanged(async (user) => {
  const signoutButton = document.getElementById('signout-button');

  if (signoutButton) {
    signoutButton.addEventListener('click', signOuts);
  }

  if (user) {
    if (user.emailVerified) {
   
      sessionStorage.setItem("user", user.displayName);
      const userId = user.uid;
      let userData = await addToDatabase(user); // get the user data from addToDatabase
      if (userData) {
        console.log(user);   
        data.textContent = userData.clicks;
      
      }
      
      else {
        console.error("User data not found or clicks property missing");
      }
      clickButton.addEventListener("click", async () => {
        const newClicks = userData.clicks + 1;
        data.textContent = newClicks;
        updateClicks(userId, newClicks);
        userData.clicks = newClicks;
      });
    } else {
      await firebase.auth().signOut();
      alert("Please verify your email before logging in.");
    }
  }
});



