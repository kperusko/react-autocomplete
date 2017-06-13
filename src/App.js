import React, { Component } from 'react';
import Autocomplete from './Autocomplete';
import './App.css';
import _ from 'lodash';

// create test data
const movies = [
  {name: "Terminator", group: "Fiction"},
  {name: "Avion", group: "Term"},
  {name: "Aviator", group: "Term"},
  {name: "Very long title", group: "Non-fiction"}
]

const groupedMovies = _(movies)
  .sortBy(["name"])
  .map((item, index) => {
    item.id = index
    return item
  }) // add fake uniq ID
  .groupBy(movie => movie.group)
  .map((value, key) => ({groupName: key, movies: value}))
  .value()

console.log(groupedMovies);


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ''
    };
  }
  render() {
    return (
      <div className="App">
        <Autocomplete
          items={groupedMovies}
          searchOptions={{keys: ["groupName", "movies.name"], threshold: 0.2}}
          value={this.state.value}
          getItemKey={item => item.id}
          getSectionItems={result => result.movies}
          onSelect={movie => this.setState({ value: movie.name }) }
          onChange={value => this.setState({ value }) }
          renderItem={(movie, isHighlighted) => {
            const className = 'autocomplete-item' + (isHighlighted ? ' autocomplete-item--highlighted' : '');
            return <li key={movie.key} className={className}>{movie.name}</li>
          }}
          renderSectionName={(item) => (
            <li className="autocomplete-group-name">{item.groupName}</li>
          )}
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
