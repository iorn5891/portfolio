import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//stateにあるTotalTimeとadjustTimeの値を変更することで、プレイリストの時間を変更できる

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file_src: "",
            url: "",
            totalTime: 3600000, //ミリ秒 1時間 プレイリストの最大時間 3600000
            adjustTime: 30000 //ミリ秒 プレイリストの最低時間。最大時間 - この値 で決まる
        }
        this.handleChangeFile = this.handleChangeFile.bind(this)
        this.outputFile = this.outputFile.bind(this)
        this.editPlayList = this.editPlayList.bind(this)
    }

    handleChangeFile(e) {
        
        var plist = require('plist');
        const reader = new FileReader();
        reader.onload = ((theFile) => {
            var obj = plist.parse(theFile.target.result);
            console.log(obj);

            this.setState({
                file_src: obj
            })
        })
        reader.readAsText(e.target.files[0], 'UTF-8')

    }

    outputFile() {
        var plist = require('plist');
        const editedPlayList = this.editPlayList(this.state.file_src);
        const blob = new Blob([plist.build(editedPlayList)], { type: 'text/plain' })
        var url = URL.createObjectURL(blob);
        this.setState({
            url: url
        })
    }

    editPlayList(file_src) {
        const tracks_src = file_src.Tracks;
        console.log(tracks_src);
        let trackList = [];
        for (let key of Object.keys(tracks_src)) {
            //チェックボックスついているものだけ取得する
            if(!("Disabled" in tracks_src[key])){
                let track = {
                    trackId: Number(key),
                    totalTime: tracks_src[key]["Total Time"]
                }
                trackList.push(track)
            }
        }
        //降順
        const sortedTrackList = trackList.sort((a, b) => { return b.totalTime - a.totalTime }).slice();
        console.log(sortedTrackList);
        let currentTotalTime = 0;
        let editedPlayList = [];
        const minimumTotalTime = this.state.totalTime - this.state.adjustTime;
        console.log("minimumTotalTime:"+ minimumTotalTime);
        //TODO:三重ループをどうにかする
        //TODO:全曲をどのように組み合わせても、トータル時間内に収まることが無い場合がある。再試行orプレイリストの最低時間を調整するエラー文を出す
        while (true) {
            //プレイリストの曲選択ループ
            let minIndex = sortedTrackList.findIndex((a) => {return a.totalTime <= this.state.totalTime - currentTotalTime})
            //もし、該当するトラックが無い場合は抜ける
            if(minIndex == -1){ break ;}
            console.log("ループ１のminIndex"+ minIndex);
            let trackId = 0;
            while(true){
                //該当するtrackを取得。取得したトラックを入れると最低限のトータルタイムを確保できない場合は、他のにするためループ
                trackId = Math.floor(Math.random() * (sortedTrackList.length - minIndex) + minIndex);
                console.log("trackId"+ trackId);
                const track = sortedTrackList[trackId];
                
                if (sortedTrackList.findIndex((a) => {return a.totalTime <= (this.state.totalTime - (track.totalTime + currentTotalTime))}) != -1) 
                {
                    //2曲以上入る場合
                    editedPlayList.push({ "Track ID": track.trackId })
                    currentTotalTime += track.totalTime;
                    console.log(currentTotalTime);
                    break;
                } else {
                    minIndex = trackId;
                    if(minIndex == sortedTrackList.length -1)
                    {
                        while(true){
                            //あと1曲しか入らない場合
                            //もし、最低限の時間 < aのトラックの時間+現在の総時間 <最大のトータル時間なら、１曲追加する
                            const newCanPushedList = sortedTrackList.filter((a) => {
                                return (minimumTotalTime <= (a.totalTime + currentTotalTime)) && (a.totalTime + currentTotalTime <= this.state.totalTime)
                                })
                            console.log(newCanPushedList);
                            if(newCanPushedList.length != -1)
                            {
                                const lastTrack = newCanPushedList[Math.floor(Math.random() *newCanPushedList.length)];
                                editedPlayList.push({ "Track ID": lastTrack.trackId })
                                currentTotalTime += lastTrack.totalTime;
                                console.log("最後の1曲" + currentTotalTime);
                                break;
                            }
                        }
                        break;
                    }
                    
                }
            }
        }
        //シャッフル。Fisher–Yatesアルゴリズムを用いる
        for (let i = editedPlayList.length - 1; i > 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            const tmp = editedPlayList[i];
            editedPlayList[i] = editedPlayList[r];
            editedPlayList[r] = tmp;
        }
        console.log(editedPlayList);
        console.log(file_src);

        //ここで代入
        file_src.Playlists = [{
            "All Items": true,
            "Description": "",
            "Name": (this.state.totalTime / 1000 / 60).toString()+"分", //プレイリスト名
            "Playlist ID": 32335,
            "Playlist Items": editedPlayList,
            "Playlist Persistent ID": "295B8F8FC2CD395B"
        }]
        return file_src;
    }


    render() {
        return (
            <div>
                <h2>iTunes プレイリスト 作成アプリ</h2>
                <p>手順について</p>
                <ol>
                    <li>iTunesアプリのヘッダーにあるメニューのファイル>ライブラリ>ライブラリを書き出すを選択して、<br></br>
                        全曲ライブラリの情報をxmlで出力する
                    </li>
                    <li>↓の"ファイルを選択"で、1.で出力したxmlを読み込む</li>
                    <li>"ファイルを出力"を選択して、xmlファイルを出力。iTunesで読み込むと、プレイリストが作成される。</li>
                </ol>
                <p>※現在は60分のプレイリストが作成される。時間を変更する場合は、直接ソースコード上で変更すること</p>
                <input type="file" onChange={this.handleChangeFile} />
                <a href={this.state.url} download="playList.xml" onClick={this.outputFile}>ファイル出力</a>
            </div>
        );
    }
}

//===============================

ReactDOM.render(<App />, document.getElementById('root'));
