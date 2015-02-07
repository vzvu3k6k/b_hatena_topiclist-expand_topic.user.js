// ==UserScript==
// @name           {{name}}
// @description    {{description}}
// @version        {{version}}
// @author         {{author}}
// @match          http://b.hatena.ne.jp/topiclist*
// @namespace      {{namespace}}
// @license        {{license}}
// @grant          GM_addStyle
// ==/UserScript==

GM_addStyle(`@@include('./tmp/style.css')`);

var $jsTopicList = document.querySelector('.js-topic-list');

$jsTopicList.addEventListener('mouseover', function(e){
  var $topicUnit = getTopicUnit(e.target);
  if(!$topicUnit) return;
  if($topicUnit.querySelector('.__expand-button')) return;
  if($topicUnit.classList.contains('__expanded-topic')) return;

  var $expandButton = document.createElement('a');
  $expandButton.textContent = '»';
  $expandButton.className = '__expand-button';
  $expandButton.addEventListener('click', expand);
  $expandButton.href = '#';
  $topicUnit.appendChild($expandButton);
});

var getTopicUnit = function($node){
  var $topicUnit = $node;
  while(!$topicUnit.classList.contains('topic-unit')){
    if($topicUnit === $jsTopicList) return null;
    $topicUnit = $topicUnit.parentNode;
  }
  return $topicUnit;
};

var expand = function(e){
  e.preventDefault();

  var $topicUnit = getTopicUnit(e.target);
  e.target.remove();

  var xhr = new XMLHttpRequest();
  xhr.open('GET', $topicUnit.querySelector('.topic-title').href + '?type=highlight');
  xhr.onload = function(){
    if(xhr.status !== 200) return;

    $topicUnit.classList.add('__expanded-topic');

    // 見出しの更新
    var fullTitle = xhr.responseXML.querySelector('.topic-data h2').textContent;
    var $currentTitle = $topicUnit.querySelector('.topic-title');
    if($currentTitle.textContent.trim().length < fullTitle.trim().length){
      $currentTitle.textContent = fullTitle;
    }

    // エントリの追加
    var entries = xhr.responseXML.querySelectorAll('.topic-list .entrylist-unit');
    var popularEntries = Array.prototype.slice.call(entries)
          .sort(function($a, $b){
            function users($node){
              return +$node.querySelector('.users span').textContent;
            }
            return users($b) - users($a);
          }).slice(0, 5);

    var $jsTopicList = document.createElement('ul');
    $jsTopicList.className = 'topic-list';
    popularEntries.forEach(function($entry){
      $entry.classList.remove('topic-hot');
      $jsTopicList.appendChild($entry);
    });
    console.log(entries, popularEntries);
    $topicUnit.appendChild($jsTopicList);
  };
  xhr.responseType = 'document';
  xhr.send();
};
