const express = require('express');
require('firebase/auth');
const firebaseAdmin = require('firebase-admin')
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;



// Initialize Firebase Admin SDK
const serviceAccount = require('your service account json file');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'your database url',
});
const db = firebaseAdmin.firestore();

app.use(express.json());
app.use(express.static('public'));


app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.get('/Celeb-Talk', async (req, res) => {

  res.sendFile(path.join(__dirname, 'public', 'Celeb-Talk.html'));

});
app.get('/', async (req, res) => {

    res.sendFile(path.join(__dirname, 'public', 'home.html'));
  
});




app.post("/createUser", async (req, res) => {
  try {
    const userInfo = req.body.userInfo;
    const userId = userInfo.uid;
    const info = {
      clicks: 20,
      displayName: userInfo.displayName,
     

    };

    const userRef = db.collection("users").doc(userId);
    await userRef.set(info);

    res.send(info);
  } catch (error) {
    console.error("Create user error:", error);
    res.sendStatus(400);
  }
});

// Server-side route for updating the clicks
app.post("/updateClicks", async (req, res) => {
  try {
    const { userId, clicks } = req.body;
    const userRef = db.collection("users").doc(userId);
    await userRef.update({ clicks });

    res.send({ clicks });
  } catch (error) {
    console.error("Update clicks error:", error);
    res.sendStatus(400);
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
