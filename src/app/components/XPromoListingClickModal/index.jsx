import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import {
  listingClickModalAppStoreClicked,
  listingClickModalDismissClicked,
} from 'app/actions/xpromo';

import cx from 'lib/classNames';
import { getExperimentVariant } from 'lib/experiments';

const CLASS = 'XPromoListingClickModal';

const showing = state => state.xpromo.listingClick.active;

const takeMeBack = state => getExperimentVariant(
  state,
  'mweb_xpromo_modal_listing_click_daily_dismissible_link'
) === 'treatment';

const selector = createStructuredSelector({
  showing,
  takeMeBack,
  dismissible: state => (showing(state)? 'dismissible': null),
  returner: state => state.xpromo.listingClick.showingReturnerModal,
});

const dispatcher = dispatch => ({
  onGotoAppStore: () => dispatch(listingClickModalAppStoreClicked()),
  onDismiss: () => dispatch(listingClickModalDismissClicked()),
});

const preventDefault = e => e.preventDefault();

export default connect(selector, dispatcher)(props => {
  const { showing } = props;

  if (!showing) {
    return <div className={ `${CLASS}__preloadImages` } />;
  }

  const {
    dismissible,
    onDismiss,
    onGotoAppStore,
    returner,
    takeMeBack,
  } = props;

  return (
    <div className={ CLASS } onScroll={ preventDefault } onTouchMove={ preventDefault }>
      <div className={ `${CLASS}__modalBox` }>
        { returner
          ? <ReturnerContent onDismiss={ onDismiss } />
          : (
            <AppStoreContent
              dismissible={ dismissible }
              onDismiss={ onDismiss }
              onGotoAppStore={ onGotoAppStore }
              takeMeBack={ takeMeBack }
            />
          ) }
      </div>
    </div>
  );
});

const ModalContent = ({ children }) => (
  <div className={ `${CLASS}__content` }>
    <div className={ `${CLASS}__promoImage` } />
    <div>
      { children }
    </div>
  </div>
);

const PrimaryText = ({ children }) => (
  <div className={ `${CLASS}__primaryText` }>
    { children }
  </div>
);

const ButtonGroup = ({ children }) => (
  <div className={ `${CLASS}__buttonGroup` }>
    { children }
  </div>
);

const Button = ({ children, onClick, outlined }) => (
  <div
    className={ cx(`${CLASS}__button`, { 'm-outlined': outlined }) }
    onClick={ onClick }
  >
    { children }
  </div>
);

const AppStoreContent = ({ dismissible, onDismiss, onGotoAppStore, takeMeBack }) => (
  <ModalContent>
    <PrimaryText>
      This content is best viewed in our mobile app.
    </PrimaryText>
    <ButtonGroup>
      { dismissible && (
          <Button outlined onClick={ onDismiss }>
            { takeMeBack ? 'Take Me Back' : 'Not Now' }
          </Button>
      ) }
      <Button onClick={ onGotoAppStore }>
        View In App
      </Button>
    </ButtonGroup>
  </ModalContent>
);

const ReturnerContent = ({ onDismiss }) => (
  <ModalContent>
    <PrimaryText>
      Thanks for checking out the Reddit mobile app
    </PrimaryText>
    <ButtonGroup>
      <Button onClick={ onDismiss }>
        Return to reddit.com
      </Button>
    </ButtonGroup>
  </ModalContent>
);
