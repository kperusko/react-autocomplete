import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';

/*
 * A simple React component
 */
class Autocomplete extends Component {
  static propTypes = {
    /**
     * The value to display in the input field
     */
    value: PropTypes.any,
    items: PropTypes.array.isRequired, // Array of items to render
    searchOptions: PropTypes.object.isRequired,  // Options for the FuseJS search library

    /**
     * Arguments: `item: Any, isHighlighted: Boolean`
     *
     * Invoked for each entry in section.children
     */
    renderItem: PropTypes.func.isRequired,

    /**
     * Arguments: `group: Any, isHighlighted: Boolean`
     *
     * Invoked for each entry in section
     */
    renderSectionName: PropTypes.func.isRequired,

    renderMenu: PropTypes.func.isRequired,

    getSectionItems: PropTypes.func.isRequired

  }

  static defaultProps = {

  }

  constructor(props) {
    super(props);

    this.state = {
      open: false,
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

    const open = results != null && results.length > 0;

    this.setState({
      results: results,
      open: open
    });
  }

  renderMenu() {
    const sections = this.state.results.map(result => {
      const menuItems = this.props.getSectionItems(result).map(item => this.props.renderItem(item, false));
      const groupName = this.props.renderSectionName(result);
      return [
        groupName,
        menuItems
      ];
    });

    return this.props.renderMenu(sections);
  }

  render() {
    const open = this.state.open;
    const sections = this.renderMenu();

    return <div>
      <input onChange={this.updateText}
             value={this.props.value} />
      {open && sections}
    </div>
  }
}

export default Autocomplete;