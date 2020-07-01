const fs = require('fs')
function readJson (inputFile) {
  return JSON.parse(fs.readFileSync(inputFile, 'utf8'))
}
function writeFile (path, data) {
  return fs.writeFileSync(path, data)
}
const _dataDir = './data/'
const _outDir = './md/'

const data = {
  poems: {
    file: _dataDir + 'main_poem.json',
    list: []
  },
  poets: {
    file: _dataDir + 'main_poet.json',
    list: []
  },
  categories: {
    file: _dataDir + 'main_cat.json',
    list: []
  },
  verses: {
    file: _dataDir + 'main_verse.json',
    list: []
  }
}

// Read content
const whiteList = ['poems', 'poets', 'categories', 'verses']
for (const field of whiteList) {
  data[field].list = readJson(data[field].file)
}

// Populate poems inside poets
for (const poem of data.poems.list) {
  console.log('Reading ' + poem.id + ' ...')
  // Find and attach all the verses
  const verses = data.verses.list.filter(function (v) { return +(v.poem_id) === +(poem.id) })
  poem.verses = verses.sort(function (a, b) { return a.vorder < b.vorder ? 0 : 1 })

  // The category for this poem
  const catIndex = data.categories.list.findIndex((c) => {
    return (poem.cat_id === c.id)
  })

  // Find the poet related to this category
  let poetID
  const parentID = data.categories.list[catIndex].parent_id
  if (parentID === 0) {
    // This cat is a poet
    poetID = data.categories.list[catIndex].poet_id
  } else {
    // Look for the parent
    const parentCatIndex = data.categories.list.findIndex((c) => {
      return (data.categories.list[catIndex].parent_id === c.id)
    })
    poetID = data.categories.list[parentCatIndex].poet_id
  }

  // Assign poem to poet
  const poetIndex = data.poets.list.map(p => p.id).findIndex(n => n === poetID)
  if (!data.poets.list[poetIndex].poems) {
    data.poets.list[poetIndex].poems = []
  }
  data.poets.list[poetIndex].poems.push(poem)
  console.log('DONE reading', poem.id)
}

// Creating files
for (const poet of data.poets.list) {
  console.log('Writing ' + poet.id, ': ', poet.name, ' ...')
  const poetDir = _outDir + poet.id
  if (!fs.existsSync(poetDir)) { fs.mkdirSync(poetDir) }
  // Creating folders for poets
  writeFile(poetDir + '/index.md', '' +
      '---\n' +
      'title: "' + poet.name + '"\n' +
      'description: "' + poet.description + '"\n' +
      'poet_id: ' + poet.id + '\n' +
      'poet: "' + poet.name + '"\n' +
      '---')
  if (poet.poems) {
    // Putting the verses inside the files
    for (const poem of poet.poems) {
      const content = '' +
          '---\n' +
          'title: "' + poem.title + '"\n' +
          'description: "' + poem.title + '"\n' +
          'post_id: ' + poet.id + '\n' +
          'poet: "' + poet.name + '"\n' +
          'poem_id: ' + poem.id + '\n' +
          'poem: "' + poem.title + '"\n' +
          '---\n\n' +
          '\n<div dir="rtl">\n\n' +
          poem.verses.map(function (a) { return a.text }).join(' \n\n ') +
          '\n\n</div>\n'
      writeFile(poetDir + '\\' + poem.id + '.md', content)
    }
  }
  console.log('DONE writing ', poet.id)
}
