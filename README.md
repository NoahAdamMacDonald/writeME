# heading
## h2
### h3
#### h4

**bold**
_italic_
~~strike~~
**_~~all three~~_**

> [!NOTE]
> note

> [!TIP]
> tip

> [!WARNING]
> warning

> [!IMPORTANT]
> important

> [!CAUTION]
> caution

- list
-     list
- list
-     list
-         list
-             list
does not move dash to be along with list

1. number
1.     number
1. number
1.     number
1.     number
does not correctly number should be
1. number
    1. number
1. number
    1. number
    2. number



- [ ] task
- [ ]     task
- [ ] task
- [ ]     task
- [ ]         task
- [ ]           task
allow option to check it off, save this for later when we actually render them as components and not just text
we will just have the user press them.


`code() in line`

```
code block
```
provide list of languages, example, select code block, get popup and select javascript creates ```javascript
var myGreatVariable = 'test'
```

[link](https://example.com)
create popup asking for link name and url, with defaults set to what was highlighted, if nothing highlighted fallback to default

Missing
- Foldable text
-tables
- Hotkeys
-horizontal line insert
-Quoting
-footnote

emoji Testing:
:grinning::up::exclamation::exclamation::grey_exclamation::grey_exclamation::grey_exclamation::interrobang::bangbang:     :tea:


Alert
    Quotes
Misc Edit Section
    Divider
    Foldable text
        ex: <details>
                <summary>Title 1</summary>
                <p>Lorem ipsum dolor sit amet, ...</p>
            </details>
    Hotkey
        ex: <kbd>⌘F</kbd>
    Tables
    Pictures
        ![picture alt](https://placehold.co/600x200 "Title is optional")
    

Links
    Link to heading or section
        [Link to heading](#heading-1 "Goto heading-1")
        [Link to section](#TOP)
