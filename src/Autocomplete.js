import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';

/*
 * A simple React component
 */
class Autocomplete extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired, // Array of items to render
    searchOptions: PropTypes.object.isRequired  // Options for the FuseJS search library
  }

  static defaultProps = {

  }

  constructor(props) {
    super(props);

    this.state = {
      search:'',
      highlightedIndex: null,
      results: []
    };

    const searchOptions = props.searchOptions;
    this.searchLib = new Fuse(props.items, searchOptions);

    // bind even handlers
    this.updateText = this.updateText.bind(this);
  }

  updateText(e) {
    const searchTerm = e.target.value;
    const results = this.searchLib.search(searchTerm);
    this.setState({search: searchTerm, results: results});
  }

  render() {
    const group = this.state.results.map(result => {
      const menuItems = result.movies.map(movie => <li>{movie.name}</li>);
      return [
        <li className="autocomplete-group-name">{result.groupName}</li>,
        menuItems
      ];
    });

    return <div>
      <input onChange={this.updateText}
             value={this.state.search} />
      <div className="autocomplete-results">
        <ul>
          {group}
        </ul>
      </div>
    </div>
  }
}

export default Autocomplete;