import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import classNames from 'lib/classNames';
import getSubreddit from 'lib/getSubredditFromState';
import createBannerProperties from 'lib/createBannerProperties';
import { defineSlot, destroySlot, getSlotId } from 'lib/dfp';
import './style.less';

function deferUntilMount(Comp) {
  return class DeferredRenderer extends React.Component {
    constructor(props) {
      super(props);

      this.state = { mounted: false };
    }

    componentDidMount() {
      this.setState({ mounted: true });
    }

    render() {
      if (!this.state.mounted) {
        return null;
      }

      return <Comp { ...this.props } />;
    }
  };
}



class BannerAd extends React.Component {
  adSlot = null;
  frame = null

  static defaultProps = {
    sizes: [[320, 50]],
  };

  defineSlot() {
    const {
      id,
      slot,
      properties,
      sizes,
      shouldCollapse,
    } = this.props;

    this.destroySlot();

    defineSlot(this.frame, {
      id,
      slot,
      properties,
      shouldCollapse,
      sizes,
    }).then((adSlot) => { this.adSlot = adSlot; });
  }

  destroySlot() {
    if (this.adSlot) {
      destroySlot(this.adSlot);

      this.adSlot = null;
    }
  }

  componentDidMount() {
    this.defineSlot();
  }

  componentWillUnmount() {
    this.destroySlot(this.adSlot);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.slot !== nextProps.slot;
  }

  render() {
    const { id, slot } = this.props;
    if (!slot) {
      return null;
    }

    return (
      <div
        data-slot={ slot }
        className={ classNames('BannerAd', {
          'BannerAd__320x50': !this.props.sizes.includes('fluid'),
          'BannerAd__fluid': this.props.sizes.includes('fluid'),
        }) }
      >
        <div ref={ ref => { this.frame = ref; } } id={ id }></div>
      </div>
    );
  }
}

const subredditSelector = (state) => {
  // const subredditName = isFakeSubreddit(listingName) ? '' : listingName.toLowerCase();
  const subredditName = getSubreddit(state) || '';
  return state.subreddits[subredditName.toLowerCase()];
};

const selector = createStructuredSelector({
  properties: (state, ownProps) => {
    const currentPage = state.platform.currentPage;
    if (!currentPage) {
      return {};
    }

    return createBannerProperties(
      ownProps.placement,
      state.user,
      subredditSelector(state, ownProps),
      state.theme,
      state.compact,
    );
  },
  slot: (state, ownProps) => {
    const subredditName = getSubreddit(state);
    return getSlotId(ownProps.listingName, subredditName);
  },
});

export default connect(selector)(deferUntilMount(BannerAd));
