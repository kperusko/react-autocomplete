import React, { Component } from 'react';
import Autocomplete from './Autocomplete';
import './App.css';
import _ from 'lodash';

const movies = [
  {name: "Terminator", group: "Fiction"},
  {name: "Avion", group: "Term"},
  {name: "Aviator", group: "Term"},
  {name: "Very long title", group: "Non-fiction"}
]

const groupedMovies = _(movies)
  .sortBy(["name"])
  .groupBy(movie => movie.group)
  .map((value, key) => ({groupName: key, movies: value}))
  .value()

console.log(groupedMovies);


class App extends Component {
  render() {
    return (
      <div className="App">
        <Autocomplete
          items={groupedMovies}
          searchOptions={{keys: ["groupName", "movies.name"], threshold: 0.2}}
          getItemValue={item => item.value}
          getSectionItems={result => result.movies}
          renderItem={(item, isHighlighted) => <li>{item.name}</li>}
          renderSectionName={(item) => <li className="autocomplete-group-name">{item.groupName}</li>}
          renderMenu={(sections) => (
            <div className="autocomplete-results">
              <ul>
                {sections}
              </ul>
            </div>
          )}
        />
      </div>
    );
  }
}

export default App;
