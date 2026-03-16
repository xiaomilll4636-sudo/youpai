const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashIdCard = (idCard) => {
  return crypto.createHash('sha256').update(idCard).digest('hex');
};

const maskPhone = (phone) => {
  if (!phone || phone.length < 7) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

const maskIdCard = (idCard) => {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2');
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  hashIdCard,
  maskPhone,
  maskIdCard,
};
