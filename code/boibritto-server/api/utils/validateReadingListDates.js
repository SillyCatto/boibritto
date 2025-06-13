// pass in req.body.data
function validateReadingListDates(data) {
  const { status, startedAt, completedAt } = data;

  if ((status === "reading" || status === "completed") && !startedAt) {
    return "startedAt is required for status 'reading' or 'completed'";
  }

  if (status === "completed" && !completedAt) {
    return "completedAt is required for status 'completed'";
  }

  if (startedAt && completedAt) {
    const start = new Date(startedAt);
    const complete = new Date(completedAt);
    if (complete < start) {
      return "completedAt cannot be before startedAt";
    }
  }

  return null; // No error
}

module.exports = { validateReadingListDates };
