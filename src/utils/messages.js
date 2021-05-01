const generateMessage = (username, message) => {
  return {
    username,
    text: message,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (username, message) => {
  return {
    username,
    url: message,
    createdAt: new Date().getTime(),
  };
};

module.exports = { generateMessage, generateLocationMessage };
