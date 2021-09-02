// const db = firebase.firestore();

export const getUserData = () => {
  const uid = localStorage.getItem('uid');
  const displayName = localStorage.getItem('displayName');
  const level = localStorage.getItem('level');
  return {
    uid,
    displayName,
    level,
  };
};

export const setUserData = () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      localStorage.setItem('uid', user.uid);
      localStorage.setItem('displayName', user.displayName);
    }
  });
};

export const removeUserData = () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      localStorage.clear();
    }
  });
};

export const updateRecipeAuthorName = (name) => {
  firebase.firestore().collection('recipes').get().then((querySnapshot) => {
    querySnapshot.forEach((recipe) => {
      if (recipe.data().user_id === firebase.auth().currentUser.uid) {
        firebase.firestore().collection('recipes').doc(recipe.id).update({
          autor: name,
        });
      }
    });
  });
};

export const updateUserDisplayName = (data) => firebase.auth().currentUser.updateProfile({
  displayName: data,
}).then(() => updateRecipeAuthorName(data));

export const updateUserAuthEmail = (data) => firebase.auth().currentUser.updateEmail(data);

export const updateUserLevel = (data, uid) => firebase.firestore().collection('levels').doc(uid).set({
  level: data,
});

export const getUserLevel = (uid) => firebase.firestore().collection('levels').doc(uid).get();

export const signUp = (email, password, signUpName) => firebase.auth()
  .createUserWithEmailAndPassword(email, password)
  .then(() => updateUserDisplayName(signUpName))
  .then(() => setUserData())
  .then(() => updateUserLevel('Nível não selecionado', getUserData().uid))
  .then(() => localStorage.setItem('level', 'Nível não selecionado'));

export const signIn = (email, password) => firebase.auth()
  .signInWithEmailAndPassword(email, password)
  .then((credential) => getUserLevel(credential.user.uid))
  .then((level) => level.data().level)
  .then((level) => localStorage.setItem('level', level))
  .then(() => setUserData());

export const signInWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  return firebase.auth().signInWithPopup(provider);
};

export const signOut = () => firebase.auth().signOut();

export const userData = (name, email, uid) => firebase.firestore().collection('users').doc(uid).set({
  name,
  email,
  level: '',
});

export const postRecipe = (recipe) => firebase.firestore().collection('recipes').add({
  likes: [],
  comments: [],
  ...recipe,
});

export const loadRecipe = () => firebase.firestore().collection('recipes').get();

export const likesPost = (postId) => firebase.firestore().collection('recipes').doc(postId).get()

  .then((docPost) => {
    const likeUsers = docPost.data().likes;
    let test;

    if (likeUsers.includes(getUserData().uid)) {
      test = firebase.firestore().collection('recipes').doc(postId).update({
        likes: firebase.firestore.FieldValue.arrayRemove(getUserData().uid),
      });
    } else {
      test = firebase.firestore().collection('recipes').doc(postId).update({
        likes: firebase.firestore.FieldValue.arrayUnion(getUserData().uid),
      });
    }
    return test;
  });

export const numLikes = (postId) => firebase.firestore().collection('recipes').doc(postId).get();

export const deletePost = (postId) => firebase.firestore().collection('recipes').doc(postId).delete();

export const uploadFoodPhoto = (file) => {
  // create storage ref
  const storeageRef = firebase.storage().ref(`userRecipePhoto/ ${file.name}`);

  // upload file
  const task = storeageRef.put(file);
  return task;
};
