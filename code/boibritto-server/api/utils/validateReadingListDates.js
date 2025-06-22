// pass in req.body.data
function validateReadingListDates(data) {
  const { status, startedAt, completedAt } = data;

  if (status === "interested") {
    if (startedAt || completedAt)
      return "startedAt and completedAt dates should not be provided if status is 'interested'";
  }

  if (status === "reading") {
    if (!startedAt)
      return "startedAt date is required when status is 'reading'";
    if (completedAt)
      return "completedAt should not be provided when status is 'reading'";
  }

  if (status === "completed") {
    if (!startedAt || !completedAt) {
      return "Both startedAt and completedAt are required when status is 'completed'";
    }

    if (new Date(completedAt) < new Date(startedAt)) {
      return "completedAt cannot be earlier than startedAt";
    }
  }

  return null; // valid
}

export default validateReadingListDates;
