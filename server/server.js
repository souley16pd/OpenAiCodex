import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi} from 'openai';

dotenv.config(); // allows us to use .env variable we have that contains openai api key value

// console.log(process.env.OPENAI_API_KEY)

const configuration = new Configuration({ // Function that accepts an object
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration);

const app = express();          // initializing express application
app.use(cors());                // setting up a couple of middleware > Allows our server to be called from the frontend
app.use(express.json());        // This is going to allow to pass json from the frontend to the backend

app.get('/', async (req, res) => {// Creating a dummy route route // Can't truly receive a lot of data from the frontend with this
    res.status(200).send({
        message: 'Hello from CodeX',
    })
})

app.post('/', async (req, res) => {  // allows us to have a body or payload. We can get the data from the body of the frontend request.
    try { // Wrapping everything in a try and catch block
        const prompt = req.body.prompt;

        const response = await openai.createCompletion({//todo This allows us to get a response from API. / This is a function that accepts an object.
            model: "text-davinci-003",
            prompt: `${prompt}`, // We're passing it from the front end. //! You may be able to run some prompts test here by typing a prompt or question manually like "What is the capital of Gabon"
            temperature: 0.7, //! higher temperature values mean the model will take more risk vs answering what it knows
            max_tokens: 25, //! The bigger this value, the longer in term of words the responses will be.
            top_p: 1,
            frequency_penalty: 0.5, //! This determines the probability of ChatGPT repeating of similar sentences often. If you ask chat gpt a similar question, it's less likely to say a similar thing
            presence_penalty: 0,
        });
        
        res.status(200).send({ //! Sending the response we get from ChatGPT back to FRONTEND
            bot: response.data.choices[0].text
        })
        } catch (error) { //! If error, this allows to get a description of error.
            console.log(error);
            res.status(500).send({ error })
        }
    })

    app.listen(5000, () => console.log('Server is running on port http://localhost:5000')); //! MAKING SURE our server is ALWAYS LISTENING for new REQUESTS. We have a callback function to let us know that we started 