function discordWebhook() {
  var formData = JSON.stringify($("#form").serializeArray());
  alert(formData);
  var xhttp = new XMLHttpRequest();
  let requestData = ``

  xhttp.open("GET", "localhost:8000", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(requestData);
}
