$('#word-check').on('submit', testWord) // onsubmit for the testWord form

async function testWord(e) {
  e.preventDefault(); // not reload page on form submit
  const word = $('[name="word"]').val();
  console.log('word', word);
  const response = await fetch('/test-word/' + word); // get (read)
  console.log('response', response);
  const data = await response.json();
  console.log('data', data);
  $('#message').text(word + (data ? ' finns ' : ' finns inte ') + ' i databasen')
}

$('#new-word').on('submit', saveWord) // onsubmit for the saveWord form

async function saveWord(e) {
  e.preventDefault(); // not reload page on form submit
  const newWord = $('[name="new-word"]').val();
  console.log('newWord', newWord);
  const response = await fetch('/new-word/', { // post (save new)
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: newWord })
  });
  console.log('response', response);
  const data = await response.json();
  console.log('data', data);
  $('#message').text(newWord + ' lades till i databasen')
}