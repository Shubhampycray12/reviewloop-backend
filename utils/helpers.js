module.exports = {
  formatPhone: (phone) => {
    // Basic normalization
    return phone.replace(/\D/g, '');
  },
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};
