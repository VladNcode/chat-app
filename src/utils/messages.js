const generateMessage = (text, username = 'Server') => {
  return { username, text, createdAt: new Date().getTime() };
};

module.exports = {
  generateMessage,
};
