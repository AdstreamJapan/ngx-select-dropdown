import { Pipe, PipeTransform } from "@angular/core";

/**
 * 半角英数字・記号をすべて全角に強制変換し、小文字化する関数
 */
const normalizeToFullWidth = (text: any): string => {
   if (text === null || text === undefined) {
      return '';
   }
   
   let str = text.toString().toLowerCase();

   str = str.replace(/[’'｀]/g, '’');
   
   // 1. まず半角カタカナを全角カタカナに変換 (NFKCを使用)
   str = str.normalize('NFKC');

   // 2. 残った半角英数・記号（! から ~ まで）を完全に全角に置換
   str = str.replace(/[!-\~]/g, (s: string) => {
      return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
   });

   return str;
};

/**
 * filters an array based on searctext
 */
@Pipe({
   name: "filterBy"
})
export class ArrayFilterPipe implements PipeTransform {
   public transform(array: any[], searchText?: string, keyName?: string) {
      if (!array || !searchText || !Array.isArray(array)) {
         return array;
      }
      
      // 検索ワードを全角＋小文字に統一
      const normalizedSearchText = normalizeToFullWidth(searchText);

      // 1箇所目：文字列配列のフィルタ
      if (typeof array[0] === 'string') {
         return array.filter((item) => 
            normalizeToFullWidth(item).indexOf(normalizedSearchText) > -1
         );
      }

      // キー指定がない場合
      if (!keyName) {
         return array.filter((item: any) => {
            for (const key in item) {
               // 2箇所目：オブジェクトプロパティのフィルタ（null安全も追加）
               if (item[key] !== null && typeof item[key] !== "object") {
                  if (normalizeToFullWidth(item[key]).indexOf(normalizedSearchText) > -1) {
                     return true;
                  }
               }
            }
            return false;
         });
      } else {
         // キー指定がある場合
         return array.filter((item: any) => {
            // 3箇所目：指定キーのフィルタ（null安全も追加）
            if (item[keyName] !== null && typeof item[keyName] !== "object") {
               if (normalizeToFullWidth(item[keyName]).indexOf(normalizedSearchText) > -1) {
                  return true;
               }
            }
            return false;
         });
      }
   }
}