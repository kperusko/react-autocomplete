import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';


class Autocomplete extends Component {
  static propTypes = {
    /**
     * The value to display in the input field
     */
    value: PropTypes.any,
    items: PropTypes.array.isRequired, // Array of items to render
    searchOptions: PropTypes.object.isRequired,  // Options for the search library

    /**
     * Arguments: `item: Any`
     *
     * Invoked when item is selected
     */
    onSelect: PropTypes.func,

    /**
     * Arguments: `value: String`
     *
     * Invoked every time the user changes the input's value.
     */
    onChange: PropTypes.func,

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

    getSectionItems: PropTypes.func.isRequired,

    /**
     * Arguments: `item: Any`
     *
     * Invoked for each entry in section.children
     * Each menu item must have an unique ID/key.
     * Provides way to retrieve the key from the the results
     */
    getItemKey: PropTypes.func.isRequired,

    /**
     * Whether or not to automatically highlight the first match in the menu.
     */
    autoHighlight: PropTypes.bool
  }

  static defaultProps = {
    autoHighlight: true
  }

  static keyDownHandlers = {
    ArrowUp(event) {
      event.preventDefault();

      const { highlightedSectionIndex, highlightedItemIndex, results } = this.state;

      // remove highlighting from the first item when the ArrowUp is pressed
      if (highlightedSectionIndex === 0 && highlightedItemIndex === 0) {
        this.setState({
          highlightedItemIndex: null,
          highlightedSectionIndex: null
        });
      }

      if (
        results.length === 0 ||
        highlightedSectionIndex === null || highlightedItemIndex === null
      ) {
        return;
      }

      if (highlightedItemIndex - 1 >= 0) {
        this.setState({
          highlightedItemIndex: highlightedItemIndex - 1
        })
      } else if (highlightedSectionIndex - 1 >= 0) {
        const previousSection = results[highlightedSectionIndex-1];
        const previousSectionItems = this.props.getSectionItems(previousSection);

        this.setState({
          highlightedItemIndex: previousSectionItems.length - 1,
          highlightedSectionIndex: highlightedSectionIndex - 1
        })
      }
    },

    ArrowDown(event) {
      event.preventDefault();

      const { highlightedSectionIndex, highlightedItemIndex, results } = this.state;

      if (results.length === 0) {
        return;
      }

      if (highlightedSectionIndex === null || highlightedItemIndex === null) {
        this.setState({
          highlightedItemIndex: 0,
          highlightedSectionIndex: 0
        });
        return;
      }

      const highlightedSection = results[highlightedSectionIndex];
      const highlightedSectionItems = this.props.getSectionItems(highlightedSection);

      if (highlightedItemIndex + 1 < highlightedSectionItems.length) {
        this.setState({
          highlightedItemIndex: highlightedItemIndex + 1
        })
      } else if (highlightedSectionIndex + 1 < results.length) {
        this.setState({
          highlightedItemIndex: 0,
          highlightedSectionIndex: highlightedSectionIndex + 1
        })
      }
    },

    Enter(event) {
      event.preventDefault();
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      highlightedItemIndex: null,
      highlightedSectionIndex: null,
      results: []
    };

    this.ignoreBlur = false;

    const searchOptions = props.searchOptions;
    this.searchLib = new Fuse(props.items, searchOptions);

    // bind event handlers
    this.updateText = this.updateText.bind(this);
    this.handleOnKeyDownEvent = this.handleOnKeyDownEvent.bind(this);
    this.handleOnBlurEvent = this.handleOnBlurEvent.bind(this);
    this.handleOnFocusEvent = this.handleOnFocusEvent.bind(this);
  }

  setIgnoreBlur(ignoreBlur) {
    this.ignoreBlur = ignoreBlur
  }

  updateText(element) {
    const searchTerm = element.target.value;
    const results = this.searchLib.search(searchTerm);
    const open = results != null && results.length > 0;

    let highlightedSectionIndex = null,
      highlightedItemIndex = null;

    if (this.props.autoHighlight) {
      highlightedSectionIndex = 0;
      highlightedItemIndex = 0;
    }

    this.setState({
      results: results,
      open: open,
      highlightedSectionIndex: highlightedSectionIndex,
      highlightedItemIndex: highlightedItemIndex
    });
    this.props.onChange(searchTerm);
  }

  highlightItemFromMouse(itemIndex, sectionIndex) {
    this.setState({
      highlightedItemIndex: itemIndex,
      highlightedSectionIndex: sectionIndex
    })
  }

  selectItemFromMouse(itemIndex, sectionIndex) {
    const section = this.props.getSectionItems(this.state.results[sectionIndex]);
    const item = section[itemIndex];

    this.setState({
      open: false,
      highlightedItemIndex: null,
      highlightedSectionIndex: null
    }, () => {
      this.ignoreBlur = false;
      this.props.onSelect(item);
    })
  }

  handleOnKeyDownEvent(event) {
    if (Autocomplete.keyDownHandlers[event.key]) {
      Autocomplete.keyDownHandlers[event.key].call(this, event);
    }
  }

  handleOnBlurEvent() {
    if (this.ignoreBlur) return;

    this.setState({
      open: false
    })
  }

  handleOnFocusEvent() {
    if (this.state.results.length > 0 && !this.state.open){
      this.setState({
        open: true
      })
    }
  }

  renderMenu() {
    const sections = this.state.results.map((result, sectionIndex) => {
      const menuItems = this.props.getSectionItems(result).map((item, itemIndex) => {
        const key = this.props.getItemKey(item);
        const isHighlighted = itemIndex === this.state.highlightedItemIndex 
          && this.state.highlightedSectionIndex === sectionIndex
        const menuItem = this.props.renderItem(item, isHighlighted);

        return React.cloneElement(menuItem, {
          onMouseEnter: () => this.highlightItemFromMouse(itemIndex, sectionIndex),
          onClick: () => this.selectItemFromMouse(itemIndex, sectionIndex),
          key: key
        })
      });

      const groupName = this.props.renderSectionName(result);
      return [
        groupName,
        menuItems
      ];
    });

    const menu = this.props.renderMenu(sections);

    return React.cloneElement(menu, {
      onMouseEnter: () => this.setIgnoreBlur(true),
      onMouseLeave: () => this.setIgnoreBlur(false)
    });
  }

  render() {
    const open = this.state.open;
    const sections = this.renderMenu();

    return <div>
      <input onChange={this.updateText}
             onKeyDown={this.handleOnKeyDownEvent}
             onBlur={this.handleOnBlurEvent}
             onFocus={this.handleOnFocusEvent}
             value={this.props.value} />
      {open && sections}
    </div>
  }
}

export default Autocomplete;