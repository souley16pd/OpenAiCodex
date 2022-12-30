import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form')   // Since we're not working with react, we have to target our html element manually by using document.querySelector; "form" is the name of the only form in our html index
const chatContainer = document.querySelector('#chat_container'); // chat_container is how we called it in our index html file

let loadInterval;// Creating a variable

function loader(element) {// function that's going to load our messages. It will take an element and return something // This will repeat every 300ms (Search box thinking visualisation)
  element.textContent = '';

  loadInterval = setInterval(() => { 
    element.textContent += '.';

    if (element.textContent === '....'){
      element.textContent = '';

    }
  }, 300)
}

function typeText(element, text) { // Loading AI answers
  let index = 0;

  let interval = setInterval(() => { // creating a new interval
    if(index < text.length) { // that means we're still typing
      element.innerHTML += text.charAt(index); // This is going to get text a character under a specific index in text that AI is going to return
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() { // unique id for every message / Using all these const below is a method to make the number as random as possible
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAi, value, uniqueId){ // This defines the color of the user prompt stripe color vs the ai response stripe color
  return (
    ` 
      <div class="wrapper ${isAi && 'ai'}">    //! Special Class 
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"  //! Source = Dynamic block of code; if it's Ai, then "bot", otherwise "user"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>} //! rendering unique value inside this div. The value is going to be the ai generated message
        </div>
      </div>
    `
  )
} // with regular strings ('), you cannot create spaces or ??enters". with template strings (`), you can.

// Creating handle trigger to get ai generated response
const handleSubmit = async (e) => { // this takes an event as first and only parameter
  e.preventDefault(); // Default browser behavior when you submit a form is to reload a browser. That's not what we want here. This line prevents the default behavior of the browser.

  const data = new FormData(form); // getting the data that we typed into the form. Passing data typed in the form.

  // generating user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt')); // passing in false as it's not the AI and passing the data

  form.reset(); // clear text area input

  // bot's chat's stripe
  const uniqueId = generateUniqueId(); // generating unique id
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId); // passing in true as it's the Ai that's typing this time around. the " " will get filled up by loader function as it's loading the message answer"

  chatContainer.scrollTop = chatContainer.scrollHeight; // As the user is typing, we want the screen to scroll so we can see the message. THis puts the new message in view

  const messageDiv = document.getElementById(uniqueId); // fetching new created div

  loader(messageDiv); // Turning on the loader

  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: { // object
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ //! Passing our valuable body.
      prompt: data.get('prompt') //! Passing an object. Data with the message coming from our text area element from the screen.
    })
  })
  
  clearInterval(loadInterval); //! Clearing internal after we get the response
  messageDiv.innerHTML = ''; // ' ' because we're not sure at which point of the loading we are when we fetch. We could be at 1 dot, 2 dot, 3 dot ...? "Bot thinking phase"

    if(response.ok) {
      const data = await response.json(); // This is giving us the actual response coming from the backend
      const parsedData = data.bot.trim(); // Parsing data

      console.log({parsedData}); //)

      typeText(messageDiv, parsedData); // passing it to our type text function which we've created before
    } else {
      const err = await response.text(); // in case of error

      messageDiv.innerHTML = "something went wrong";

      alert(err); //! alerting the error
    }
  }

form.addEventListener('submit', handleSubmit);// This allows us to see the changes that we made to our handle submit by Polling it. This listener listens to a submit event.
form.addEventListener('keyup', (e) => { // keyup means when you press and release the key (keyboard button). Typically we use enter keys to submit instead of clicking a button. That's why we're setting this up to respond to a keyboard key press, the "enter" key in this instance.
  if (e.keyCode === 13) { // 13 is the ?? keycode for the enter key?
    handleSubmit(e);
  }
})