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
        <Autocomplete items={groupedMovies}
                      searchOptions={{keys: ["groupName", "movies.name"], threshold: 0.2}}
        />
      </div>
    );
  }
}

export default App;
