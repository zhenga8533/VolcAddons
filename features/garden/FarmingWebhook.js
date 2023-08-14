import request from "../../../requestV2";

const webhookUrl = "https://discord.com/api/webhooks/1140457956345917461/7r7ldlNJB7BEKcF4Y0cnL2bHuP9lOBpqS00wxCzJvtvbQcWxKHNnFjqFg5Z14S2K6gS6";
request({
    url: webhookUrl,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      "User-Agent": "Mozilla/5.0"
    },
    body: {
      "username": "Captain Test",
      "avatar_url": "https://i.imgur.com/d9dADGI.jpg",
    //  "content": "content here",
      "embeds": [
        {
          "title": "E",
          "color": 16740639,
          "description": "test",
          "footer": {
            "text": "test.",
          },
          "fields": []
        }
      ]
    }

});
