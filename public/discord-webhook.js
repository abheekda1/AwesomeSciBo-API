window.onload = function() {
  //document.getElementById("submitQuestion").disabled = true;
  document.getElementById("spaceSelect").style.display = "none";
  document.getElementById("earthSelect").style.display = "none";
  var category = document.getElementById("category").value;
  var spaceSubcategories = document.getElementById("spaceSelect");
  var earthSubcategories = document.getElementById("earthSelect");
  if (category == "Space") {
    spaceSubcategories.style.display = "block";
    earthSubcategories.style.display = "none";
  } else {
    earthSubcategories.style.display = "block";
    spaceSubcategories.style.display = "none";
  }
}

function toggleSubcategories() {
  var category = document.getElementById("category").value;
  var spaceSubcategories = document.getElementById("spaceSelect");
  var earthSubcategories = document.getElementById("earthSelect");
  if (category == "Space") {
    spaceSubcategories.style.display = "flex";
    earthSubcategories.style.display = "none";
  } else {
    earthSubcategories.style.display = "flex";
    spaceSubcategories.style.display = "none";
  }
}

function sendRequests() {
    var category = document.getElementById("category").value;
    var apiKey = document.getElementById("apiKey").value;
    var tossupQuestionFormat = document.getElementById("tossupQuestionFormat").value;
    var tossupQuestion = document.getElementById("tossupQuestion").value.replace(/w\)/gi, "\\nW)").replace(/x\)/gi, "\\nX)").replace(/y\)/gi, "\\nY)").replace(/z\)/gi, "\\nZ)");
    var tossupAnswer = document.getElementById("tossupAnswer").value;
    var bonusQuestionFormat = document.getElementById("bonusQuestionFormat").value;
    var bonusQuestion = document.getElementById("bonusQuestion").value.replace(/w\)/gi, "\\nW)").replace(/x\)/gi, "\\nX)").replace(/y\)/gi, "\\nY)").replace(/z\)/gi, "\\nZ)");
    var bonusAnswer = document.getElementById("bonusAnswer").value;
    var subCategory;
    var difficulty = document.getElementById("difficulty").value;

    if (document.getElementById("spaceSelect").style.display == 'none') {
      subCategory = document.getElementById("earthSelect").value;
    } else {
      subCategory = document.getElementById("spaceSelect").value;
    }

    var discordRequest = `{"username": "Question Additions", "avatar_url": "https://moose.lcsrc.org/servericon.png", "allowed_mentions": { "parse": [] }, "embeds": [{
    "title": "New question added!",
    "fields": [
    {
      "name": "Difficulty",
      "value": "${difficulty}"
    },

    {
      "name": "Category",
      "value": "${category}"
    },
    {
      "name": "Subcategory",
      "value": "${subCategory}"
    },
    {
      "name": "Tossup",
      "value": "*${tossupQuestionFormat}* - ${tossupQuestion}"
    },
    {
      "name": "Tossup Answer",
      "value": "${tossupAnswer}"
    },
    {
      "name": "Bonus",
      "value": "*${bonusQuestionFormat}* - ${bonusQuestion}"
    },
    {
      "name": "Bonus Answer",
      "value": "${bonusAnswer}"
    }

    ],
    "color": "7059711"
    }]
    }`;
    var dbRequest = `{"Difficulty": ${difficulty}, "Category": "${category}", "Subcategory": "${subCategory}", "Tossup Question Format": "${tossupQuestionFormat}", "Tossup Question": "${tossupQuestion}", "Tossup Answer": "${tossupAnswer}", "Bonus Question Format": "${bonusQuestionFormat}", "Bonus Question": "${bonusQuestion}", "Bonus Question Answer": "${bonusAnswer}"}`;
    if (xhttpDbRequest(dbRequest) === 200) {
      alert("Added to database successfully!");
      xhttpDiscordRequest(discordRequest);
    } else {
      alert("Unable to add to database!");
    }
}

function xhttpDiscordRequest(discordRequest) {
  var xhttp = new XMLHttpRequest();

  xhttp.open("POST", "https://discord.com/api/webhooks/826671136971816971/UpO077SVdMyWjfllSREFeFxwVaWYrdIRYtcb4rQCvxy3sYI3UEmiAJWDzTeqKfGIfscb", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(discordRequest);
}

function xhttpDbRequest(dbRequest) {
  var xhttp = new XMLHttpRequest();
  var responseStatus;
  xhttp.open("POST", "http://localhost:8000/addQuestion", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.setRequestHeader("apikey", apiKey);
  xhttp.onload = function () {
      alert(xhttp.status + " " + xhttp.statusText + ": " + xhttp.responseText);
      responseStatus = xhttp.status;
  };
  xhttp.send(dbRequest)
  return responseStatus;
}
