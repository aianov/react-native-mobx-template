import { themeStore } from '@theme/stores';
import { TextAlignT } from '@ui/types';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { DimensionValue, Text, TextProps } from 'react-native';

interface MainTextProps extends TextProps {
   px?: number;
   tac?: TextAlignT;
   marginTop?: number;
   fontWeight?: string;
   color?: string;
   mR?: number;
   primary?: boolean;
   width?: DimensionValue;
   numberOfLines?: number;
   mL?: number;
   mB?: number;
   debug?: boolean;
}

export const MainText = observer(({
   style,
   px = 16,
   tac = 'auto',
   marginTop = 0,
   mR = 0,
   mL = 0,
   mB = 0,
   numberOfLines = 0,
   width = "auto",
   debug = false,
   color = themeStore.currentTheme.text_100,
   fontWeight = 'normal',
   primary = false,
   ...props
}: MainTextProps) => {
   const { currentTheme } = themeStore;

   if (primary) color = currentTheme.primary_100;

   return (
      <Text
         numberOfLines={numberOfLines}
         ellipsizeMode="tail"
         style={[
            debug && {
               borderWidth: 0.2,
               borderColor: "red"
            },
            {
               fontSize: px,
               color,
               textAlign: tac,
               marginTop,
               marginRight: mR,
               marginLeft: mL,
               marginBottom: mB,
               fontWeight: fontWeight as any,
               width,
            },
            style
         ]}
         {...props}
      />
   );
});