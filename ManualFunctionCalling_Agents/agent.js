const {
    calculator, getCurrentTime, webSearch
} = require("./tools");



// later replace by openai.chat.completions.create() which is the new way to call the chat completions API in the latest OpenAI SDK
function chooseTool(userInput){

    const text = userInput.toLowerCase();

    if(text.includes("calculate") || text.includes("what is") || text.includes("evaluate")){
        return "calculator";
    }   
    else if(text.includes("time") || text.includes("date") || text.includes("current time")){           
        return "getCurrentTime";
    } 
    else {
        return "webSearch";
    }

    return null;
}




function runAgent(userInput) {

  const tool = chooseTool(userInput);

  if (!tool) {
    return "No tool needed.";
  }

  if (tool === "calculator") {

    const result =
      calculator(userInput);

    return `Answer: ${result}`;
  }

  if (tool === "time") {

    const result =
      getCurrentTime();

    return result;
  }

  if (tool === "search") {

    const result =
      searchWeb(userInput);

    return result;
  }
}

module.exports = {
  runAgent
};
