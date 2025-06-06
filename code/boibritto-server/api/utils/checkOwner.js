const checkOwner = (documentUserField, userId) => {
  if (!documentUserField || !userId) return false;

  const documentUserId =
    typeof documentUserField === "object" && documentUserField._id
      ? documentUserField._id.toString()
      : documentUserField.toString();

  return documentUserId === userId.toString();
};

module.exports = { checkOwner };
