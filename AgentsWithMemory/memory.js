const memory = {
  messages: [],
  facts: {},
};

function saveMemory(userInput) {
  const nameMatch = userInput.match(/my name is (.+)/i);

  if (nameMatch) {
    memory.facts.name = nameMatch[1];
  }
}

function agent(userInput) {
  memory.messages.push({
    role: "user",
    content: userInput,
  });

  saveMemory(userInput);

  let answer;

  if (userInput.toLowerCase().includes("what is my name")) {
    if (memory.facts.name) {
      answer = `Your name is ${memory.facts.name}.`;
    } else {
      answer = "I don't know your name yet.";
    }
  } else if (userInput.toLowerCase().includes("my name is")) {
    answer = `Nice to meet you, ${memory.facts.name}.`;
  } else {
    answer = "I heard you.";
  }

  memory.messages.push({
    role: "assistant",
    content: answer,
  });

  return answer;
}

console.log(agent("My name is Maha"));
console.log(agent("What is my name?"));