import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import classNames from 'lib/classNames';
import getSubreddit from 'lib/getSubredditFromState';
import get from 'lodash/get';

import { State } from 'app/reducers';
// import deferUntilMount from 'higherOrderComponents/deferUntilMount';
// import addQueryParams from 'lib/addQueryParams';
/*
import {
  AD_SIZE_300_250,
  AdPlacement,
  BannerAdSizes,
} from 'lib/constants';
*/
import createBannerProperties from 'lib/createBannerProperties';
import { defineSlot, destroySlot, getSlotId } from 'lib/dfp';
import isFakeSubreddit from 'lib/isFakeSubreddit';
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

      return <Comp {...this.props} />;
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
    }).then(adSlot => this.adSlot = adSlot);
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
        })}
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

    const origin = `${state.meta.protocol}://${state.meta.domain}`;
    return createBannerProperties(
      ownProps.placement,
      state.user,
      subredditSelector(state, ownProps),
      state.theme,
      state.compact,
      //   1. location.href doesn't exist on the server, which will cause this
      //      to break in the case of server side rendering.
      //   2. if there are hash params in the url, we'll end up with an iframe
      //      url with more than one hash
      // addQueryParams(`${origin}${currentPage.url}`, currentPage.queryParams),
    );
  },
  slot: (state, ownProps) => {
    const subredditName = getSubreddit(state);
    return getSlotId(ownProps.listingName, subredditName);
  },
});

export default connect(selector)(deferUntilMount(BannerAd));
