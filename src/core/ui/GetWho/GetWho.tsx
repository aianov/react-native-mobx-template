import { observer } from 'mobx-react-lite'
import { TextStyle, View, ViewStyle } from 'react-native'
import { MainText } from '../MainText/MainText'

export const GetWho = observer(({
   who,
   mainStyle = {},
   textStyle = {},
   bRad = 5,
   paddingHorizontal = 5,
   paddingVertical = 3,
   marginTop = 0,
   px = 9
}: GetWhoProps) => {
   return (
      <View
         style={[mainStyle, {
            backgroundColor: "black",
            paddingHorizontal: paddingHorizontal,
            paddingVertical: paddingVertical,
            borderRadius: bRad,
            marginTop: marginTop
         }]}
      >
         <MainText px={px} style={textStyle}>{who ? who : 'Самурай'}</MainText>
      </View>
   )
})

interface GetWhoProps {
   who: string
   mainStyle?: ViewStyle
   textStyle?: TextStyle
   bRad?: number
   paddingHorizontal?: number
   paddingVertical?: number
   marginTop?: number
   px?: number
}