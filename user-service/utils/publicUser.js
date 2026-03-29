/** Omit secrets from user records returned by the API. */
function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    createdAt: user.createdAt,
  };
}

module.exports = { toPublicUser };
