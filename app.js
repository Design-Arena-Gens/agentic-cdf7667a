const schedules = [
  {
    origin: "Central Station",
    destination: "Riverside Park",
    times: ["05:30", "06:15", "07:00", "07:45", "09:00", "11:30", "14:15", "16:45", "19:10", "21:30"],
    duration: "25 min",
  },
  {
    origin: "Central Station",
    destination: "Hilltop Campus",
    times: ["06:00", "06:20", "06:40", "07:00", "07:30", "08:00", "09:00", "11:00", "13:30", "17:30", "20:45"],
    duration: "35 min",
  },
  {
    origin: "Old Town",
    destination: "Central Station",
    times: ["05:45", "06:30", "07:45", "09:15", "12:00", "15:30", "18:00", "20:00", "22:15"],
    duration: "40 min",
  },
  {
    origin: "Tech Park",
    destination: "Central Station",
    times: ["06:10", "06:50", "07:30", "08:10", "09:00", "12:15", "15:45", "18:20", "21:00"],
    duration: "22 min",
  },
  {
    origin: "Riverside Park",
    destination: "Tech Park",
    times: ["06:40", "07:20", "08:00", "08:40", "10:00", "12:40", "15:00", "17:40", "20:10"],
    duration: "30 min",
  },
  {
    origin: "Hilltop Campus",
    destination: "Old Town",
    times: ["06:55", "08:15", "09:45", "11:15", "13:45", "16:00", "18:30", "21:15"],
    duration: "28 min",
  },
];

const originSelect = document.getElementById("origin");
const destinationSelect = document.getElementById("destination");
const resultContainer = document.getElementById("result");
const form = document.getElementById("route-form");

const originMap = schedules.reduce((map, schedule) => {
  if (!map.has(schedule.origin)) {
    map.set(schedule.origin, new Set());
  }
  map.get(schedule.origin).add(schedule.destination);
  return map;
}, new Map());

const createOption = (value) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
};

const populateOrigins = () => {
  const origins = Array.from(originMap.keys()).sort();
  origins.forEach((origin) => originSelect.appendChild(createOption(origin)));
};

const populateDestinations = (origin) => {
  destinationSelect.innerHTML = "";
  if (!originMap.has(origin)) {
    destinationSelect.appendChild(createOption("Select a valid origin"));
    destinationSelect.disabled = true;
    return;
  }
  destinationSelect.disabled = false;
  const destinations = Array.from(originMap.get(origin)).sort();
  destinations.forEach((destination) => destinationSelect.appendChild(createOption(destination)));
};

const parseTimeToDate = (time, dayOffset = 0) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  if (dayOffset) {
    date.setDate(date.getDate() + dayOffset);
  }
  return date;
};

const formatTime = (date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateLabel = (date, reference = new Date()) => {
  const isToday = date.toDateString() === reference.toDateString();
  if (isToday) {
    return "today";
  }
  const tomorrow = new Date(reference);
  tomorrow.setDate(reference.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  return isTomorrow ? "tomorrow" : date.toDateString();
};

const findSchedule = (origin, destination) =>
  schedules.find((entry) => entry.origin === origin && entry.destination === destination);

const findNextDeparture = (times) => {
  const now = new Date();
  for (const time of times) {
    const departure = parseTimeToDate(time);
    if (departure >= now) {
      return { departure, label: formatDateLabel(departure, now) };
    }
  }
  const nextDayDeparture = parseTimeToDate(times[0], 1);
  return { departure: nextDayDeparture, label: formatDateLabel(nextDayDeparture, now) };
};

const buildResult = (schedule, nextDeparture) => {
  const { departure, label } = nextDeparture;
  const timeText = formatTime(departure);
  const arrival = new Date(departure.getTime() + parseDuration(schedule.duration));
  const arrivalLabel = formatDateLabel(arrival, departure);
  const arrivalTime = formatTime(arrival);

  resultContainer.innerHTML = `
    <h2>Next bus leaves ${label} at <strong>${timeText}</strong></h2>
    <div class="result-details">
      <div><strong>Route:</strong> ${schedule.origin} → ${schedule.destination}</div>
      <div><strong>Travel time:</strong> ${schedule.duration}</div>
      <div><strong>Estimated arrival:</strong> ${arrivalTime} ${arrivalLabel !== label ? `(${arrivalLabel})` : ""}</div>
      <div><strong>Local time now:</strong> ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
    </div>
  `;
};

const parseDuration = (durationString) => {
  const [value, unit] = durationString.split(" ");
  const minutes = unit.startsWith("min") ? Number(value) : 0;
  return minutes * 60 * 1000;
};

const showError = (message) => {
  resultContainer.innerHTML = `<p class="error">${message}</p>`;
};

populateOrigins();
populateDestinations(originSelect.value);

originSelect.addEventListener("change", (event) => {
  populateDestinations(event.target.value);
  resultContainer.innerHTML = "";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const origin = originSelect.value;
  const destination = destinationSelect.value;

  const schedule = findSchedule(origin, destination);
  if (!schedule) {
    showError("No schedule found for that route. Try a different combination.");
    return;
  }

  const nextDeparture = findNextDeparture(schedule.times);
  buildResult(schedule, nextDeparture);
});
