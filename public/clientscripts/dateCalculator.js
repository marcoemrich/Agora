
var dateCalculator = function (initialMoment) {

  var toUtc = function (dateString, timeString) {
    if (dateString && timeString) {
      return moment.utc(dateString + " " + timeString, 'D.M.YYYY H:m');
    }
    return null;
  };

  var dateString = function (date) {
    if (date) {
      return date.format('DD.MM.YYYY');
    }
    return "";
  };

  var timeString = function (time) {
    if (time) {
      return time.format('HH:mm');
    }
    return "";
  };

  var setEndDateTo = function (currentTimes, newEndDate) {
    if (currentTimes.endDate || dateString(currentTimes.start) !== dateString(newEndDate)) {
      // only update the field if it was not empty or if the date is not the same
      currentTimes.endDate = dateString(newEndDate);
    }
  };

  ////////////////////////////////////////////////////
  var oldStartDate = initialMoment;

  return {
    getOldStartDate: function () {
      return oldStartDate;
    },

    calculateNewDates: function (currentTimes) {
      var newStartDate = currentTimes.start;

      var offset = oldStartDate && newStartDate ? newStartDate.diff(oldStartDate, 'minutes') : 0;

      oldStartDate = newStartDate;

      if (offset !== 0) {
        var newEndDate = currentTimes.end.add(offset, 'minutes');
        currentTimes.end = newEndDate;
        setEndDateTo(currentTimes, newEndDate);
      }
      return currentTimes;
    }

  };

};