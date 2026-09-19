# Egypt's Digital Museum

Egypt's Digital Museum is a single-page website about ancient Egypt. It contains a collection of 29 objects, a timeline covering different periods of Egyptian history, online exhibitions, a cartouche maker, and a few themed routes through the collection.

The website is built using simple HTML, CSS, and JavaScript. There are no frameworks or complicated setup steps.

## Features

### Collection

Browse the museum's collection and search for objects by name, material, museum, or tag.

You can also filter objects by era or category and sort them by date or title.

Each object has its own page with information such as:

* Material
* Dimensions
* Findspot
* Current location
* Inventory number
* Short facts
* Photo source

You can also use the left and right arrow keys to move between objects.

### Timeline

The timeline covers eleven periods of Egyptian history, from the Predynastic Period to Roman Egypt.

You can move through the timeline using the mouse, arrow buttons, or keyboard. Each period includes some important events and related objects from the collection.

### Exhibitions

The website includes four online exhibitions.

Each exhibition has its own opening and closing dates. The website automatically shows whether an exhibition is currently available, opening soon, closing soon, or finished.

Visitors can also reserve a place through a simple form. Reservations are saved in the browser and are not sent to an external service.

### Cartouche Maker

The cartouche maker lets you enter a name and convert it into a simple hieroglyphic representation.

You can choose the direction and style of the cartouche. The result can also be saved as an image or copied as text.

### Routes

Routes are themed tours through the museum.

They guide you through selected objects one by one and show your progress as you go.

### Other Features

The website also includes:

* Object of the Day
* Hieroglyph animation
* Interactive pyramid effect
* Quick search
* Dark and light themes
* Reading progress indicator
* Keyboard navigation
* Mobile-friendly layout


## Project Structure

```text
index.html        Main page
css/styles.css    Website styles
js/data.js        Museum data
js/app.js         Website functionality
assets/           Images and other assets
```

## Running the Website

You can simply open `index.html` in your browser.

If you prefer to run it using a local server, you can use Python:

```bash
python -m http.server 8000
```

Then open the address shown by the server in your browser.

## Adding a New Object

Museum objects are stored in `js/data.js`.

A basic object looks like this:

```js
{
  id: 'rosetta-stone',
  title: 'Rosetta Stone',
  era: 'ptolemaic',
  date: '196 BCE',
  year: -196,
  category: 'writing',
  featured: true,
  material: 'Granodiorite',
  dims: '112 cm tall, 76 cm wide, 760 kg',
  findspot: 'Fort Julien, Rashid',
  museum: 'British Museum, London',
  inventory: 'EA 24',
  summary: 'Short description of the object.',
  story: 'More information about the object.',
  facts: ['Fact one', 'Fact two', 'Fact three'],
  tags: ['writing', 'Egypt', 'history']
}
```

The same file also contains the information used for the timeline, exhibitions, and routes.

## Photographs

The museum currently uses photographs from Wikimedia Commons.

The source and licence information for each photograph is shown with the object.

If you use your own photographs, make sure you have permission to use them and update the image information in the project.

## Browser Support

The website is designed to work with modern versions of:

* Google Chrome
* Microsoft Edge
* Mozilla Firefox
* Safari

## Licence

This project is licensed under the MIT Licence.
