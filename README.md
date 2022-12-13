# KinderPic

## 작품 소개
* 선생님들은 유치원에서 소풍을 가거나 활동을 진행할 때 많은 사진을 찍지만, 원생들의 사진들을 일일이 분류하기 힘들며, 아이가 잘 나온 사진들을 골라내는 것도 어려운 일입니다. 
저희 어플은 아이들의 활동사진을 업로드하면, 그 사진들에서 원생들의 얼굴을 인식하여 원생들끼리 분류합니다. 그 후 감정 분석을 통하여 아이들의 웃는 얼굴이 담긴 사진만을 뽑아내어 최종적으로 아이들 별로 사진을 분류하고 아이들이 잘 나온 사진을 따로 걸러내는 작업을 통해 선생님들에게 도움을 주고자 합니다. 또한, 학부모들은 사진을 일일이 확인하며 다운로드 하거나 사진이 집으로 올 때까지 기다릴 필요 없이 버튼 하나로 아이의 모든 사진을 받을 수 있는 편리함을 느낄 수 있습니다.

## 작품구성도
<img style="border: 1px solid black !important; border-radius:20px; " src="https://user-images.githubusercontent.com/61824695/133082867-e6804884-88fa-4714-969e-e40bfe76d5df.png" width="500px" />

## 작품의 개발배경 및 필요성
* 기존 서비스들은 공유와 날짜, 시간별 분류에 초점이 맞추어져 있지만 해당 프로젝트는 사진과 그 속 인물에 초점을 맞추어 사람이 해야 할 분류작업을 대신 해주는 것에 의의가 있습니다. 또한, 인물 별로 일일이 사진을 분류하는 시간 등과 같은 시간적 낭비를 줄일 수 있고, 이로 인해 아이들의 사진을 선생님은 빠르게 나눌 수 있으며 학부모는 언제든 찾아볼 수 있습니다. 마지막으로 웃는 사진, 얼굴이 분명히 나온 선명한 사진만을 추출함으로써 사진의 질이 향상될 수 있습니다.

## 작품의 특장점
* 학부모에게 아이들의 사진을 직접 분류해서 다시 보내고 연락함으로써 생기는 감정소모 등의 낭비, 시간적 낭비를 줄일 수 있습니다. 또한, 다른 학우들의 사진도 볼 수 있어 아이의 원생활이 어떠한지 유추해볼 수 있어 학부모는 걱정을 줄일 수 있습니다.

## 작품 기능
* 플랫폼 - 앱 운영서버, 이미지를 전달 받아 분석과 분류 후 전달하는 역할을 합니다.
* 이미지 share – 학급과 장소마다 그룹을 지정, 그 그룹 안에서만 이미지를 공유하도록 보안적 측면을 고려하고 각각 아이들을 볼 수 있습니다. 분류에 따라 원하는 사진도 볼 수 있고, 학부모는 그 사진을 모아보거나 내려 받을 수 있습니다.
* 이미지 분석 - 얼굴인식 / 분류 - 등록자의 얼굴과 매칭 분류를 통해 각자가 나온 사진을 분류해서 태깅합니다.
* 이미지 분석 - 감정인식 / 잘 나온 사진 - 등록자로 선택된 인물이(배경으로 지나가는 사람들은 감정인식에서 제외함) 웃는 표정, 재미있는 표정 등 사진에 찍히기 위해 제대로 된 표정을 지었는지 확인해서 분류합니다.

## 작품의  기대효과 및 활용분야
* 아이들의 사진을 하나하나 찾아보지 않고 바로 볼 수 있기에 사진을 공유하는 과정을 더 편하게 만들고 사진을 분류하는 사용자의 시간을 절감합니다. 또한, 마스크를 쓰는 상황이 지속되는 만큼 마스크 쓴 얼굴인식에 대해서 파악이 가능하도록 고려해본다.

## 사용한 기술 스택
* VS code / JavaScript
* Mongo DB
* AWS

## 개발기간
2021.03.05 ~ 2021.08.28
=======