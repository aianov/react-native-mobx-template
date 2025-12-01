import React, { ReactNode, useEffect } from 'react';
import { Notifier } from './Notifier';
import { NotifierProvider } from './NotifierContext';
import { useNotifier } from './hooks';

interface NotifierWrapperInnerProps {
	children: ReactNode;
}

const NotifierWrapperInner: React.FC<NotifierWrapperInnerProps> = ({ children }) => {
	const { showNotification, hideNotification } = useNotifier();

	useEffect(() => {
		Notifier.setShowNotification(showNotification);
		Notifier.setHideNotification(hideNotification);

		return () => {
			Notifier.setShowNotification(() => { });
			Notifier.setHideNotification(() => { });
		};
	}, [showNotification, hideNotification]);

	return children;
};

interface NotifierWrapperProps {
	children: ReactNode;
}

export const NotifierWrapper: React.FC<NotifierWrapperProps> = ({ children }) => {
	return (
		<NotifierProvider>
			<NotifierWrapperInner>
				{children}
			</NotifierWrapperInner>
		</NotifierProvider>
	);
};

// setTimeout(() => {
// 	Notifier.showNotification({
// 	  title: 'test',
// 	  description: 'test',
// 	  duration: 100000,
// 	  onPress: () => {
// 		 console.log('onPress');
// 	  },
// 	  onLongPress: () => {
// 		 console.log('onLongPress');
// 	  },
// 	  longPressDuration: 700,
// 	  longPressScale: 0.95,
// 	  onHidden: () => {
// 		 console.log('onHidden');
// 	  },
// 	  sound: require('@sounds/notify.mp3'),
// 	  hideOnPress: false,
// 	  componentProps: {
// 		 imageSource: require('@images/AppLogo.png'),
// 	  },
// 	});
//  }, 3000);