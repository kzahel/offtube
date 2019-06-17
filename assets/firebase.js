var firebaseConfig = {
  apiKey: "AIzaSyBUyt2hGhHkfCs5Yj6SXmXBaUoy0HCNajg",
  authDomain: "offtube-server.firebaseapp.com",
  databaseURL: "https://offtube-server.firebaseio.com",
  projectId: "offtube-server",
  storageBucket: "offtube-server.appspot.com",
  messagingSenderId: "626079761983",
  appId: "1:626079761983:web:9bcace690396d653"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
function login() {
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}


function add() {
  var userId = firebase.auth().currentUser.uid;
  db.collection("users").doc(userId).set({
    a: "Los Angeles" + Math.random(),
    b: "bee",
  })
    .then(function() {
      console.log("Document successfully written!");
    })
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });
}

function query() {
  var docRef = db.collection("users").doc("kyle");
  docRef.get().then(function(doc) {
    if (doc.exists) {
      console.log("Document data:", doc.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }).catch(function(error) {
    console.log("Error getting document:", error);
  });
}
