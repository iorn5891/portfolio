iTunes プレイリスト 作成アプリ

手順について
１．iTunesアプリのヘッダーにあるメニューのファイル>ライブラリ>ライブラリを書き出すを選択して、
　全曲ライブラリの情報をxmlで出力する
２．"ファイルを選択"で、1.で出力したxmlを読み込む
３．"ファイルを出力"を選択して、xmlファイルを出力。iTunesで読み込むと、プレイリストが作成される。

※現在は60分のプレイリストが作成されます。時間を変更する場合は、直接ソースコード上で変更すること
※曲数が少ない場合や再生時間に偏りがある場合はエラーが起きやすいです
　エラー回避するには、ソースコードのadjustTimeの値を大きくして、プレイリストの再生時間に幅を持たせてください。