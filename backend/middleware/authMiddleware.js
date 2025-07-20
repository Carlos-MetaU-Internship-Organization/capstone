function requireAuth(req, res, next) {
  if (req.session?.user?.id) {
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized: User Not Logged In' })
}

function requireMasterUser(req, res, next) {
  const masterUserId = parseInt(process.env.MASTER_USER_ID);

  if (req.session?.user?.id === masterUserId) {
    return next();
  }

  return res.status(403).json({ message: 'Unauthorized' })
}

module.exports = { requireAuth, requireMasterUser };