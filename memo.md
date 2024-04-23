firebaseとの接続方法

<br>

react-hook-form
認証情報のバリデーションチェックが簡単に行える

<br>

ログアウトボタンのonClick属性はonClick={handleLogout}ではだめ<br>
アロー関数でなければ、リロードのたびに実行されてしまう
```
<div
 onClick={() => handleLogout}
 className='text-lg flex items-center justify-evenly mb-2 cursor-pointer p-4 border drop-shadow-lg hover:bg-gray-300 duration-100'
>
  <FaSignOutAlt />
  <span>ログアウト</span>
</div>
```

<br>

SSGやSSRといったNextの強みを使用していない
➡バックエンドfirebaseを使ってonSnapshot等行っていたので必要性が少なかった。

<br>

レスポンシブ未対応

<br>

routerにはlocationというグローバル変数が使われており、useEffect内で書かれないと機能しない。
