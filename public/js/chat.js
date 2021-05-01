const socket = io();

// elements
const $messageForm = document.querySelector("#input-form");
const $messageFormInput = document.getElementById("input-text");
const $messageFormButton = document.getElementById("input-button");
const $sendLocationButton = document.getElementById("send-location");
const $messages = document.getElementById("messages");

// message template
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationMessageTemplate = document.getElementById(
  "location-message-template"
).innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// options -(query)
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
}); // used qs lib for query

const autoscroll = () => {
  $newMessage = $messages.lastElementChild;
  // $newMessage.scrollIntoView({
  //   behavior: "smooth",
  //   block: "end",
  //   inline: "nearest",
  // });

  // height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of message container
  const containerHeight = $messages.scrollHeight;

  // how far have i scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"), // moment lib for date format
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// location message
socket.on("locationMessage", (message) => {
  console.log(message.url);
  const html = Mustache.render(locationMessageTemplate, {
    // mustache lib for rendering
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let input_value = $messageFormInput.value;
  $messageFormButton.setAttribute("disabled", "disabled");
  socket.emit("sendMessage", input_value, (message) => {
    console.log(message);
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Your browser does not supports Geolocation");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (message) => {
        $sendLocationButton.removeAttribute("disabled");
        console.log(message);
      }
    );
  });
});

// emiting username and room
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
