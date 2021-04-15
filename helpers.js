const getUserByEmail = (email,object) => {
  for (let key in object) {
    if (email ===  object[key].email) {
    return object[key];
    }
  return undefined;
  }
}

module.exports = { getUserByEmail };