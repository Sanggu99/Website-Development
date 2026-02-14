import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

const SUPABASE_URL = 'https://jmgrqtjivjkqnrtkymwq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZ3JxdGppdmprcW5ydGt5bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mzk5NDUsImV4cCI6MjA4NjMxNTk0NX0.lwJel7F_w1GEA11r-xpUGMzoNyAyxcmekFMUQDi6bz4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper function to translate Korean text to English
function translateText(text) {
    const translations = {
        // Project 1: 화성시 테마(어린이)과학관
        "언박시움은 어린이와 과학을 충돌시키지 않고 서로를 이해하게 하기 위해 과학적 탐구는 정보가 아닌 유기적인 여정으로 경험되어야 한다는 개념으로 발견·탐험·상상의 단계를 통해 공간을 구현한다.": "UNBOXIUM implements space through the stages of discovery, exploration, and imagination, based on the concept that scientific inquiry should be experienced as an organic journey rather than mere information, in order to help children and science understand each other rather than collide.",
        "세상을 설명하는 과학과 상상과 함께 세상을 바라보는 어린이를 연결하는 과학관, UNBOXIUM.": "UNBOXIUM is a science museum that connects science explaining the world with children viewing the world with imagination.",
        "상상은 기준이 없고 놀이에는 답이 없으며 때로는 엉뚱한 진실이 가장 큰 진실을 품고 있다.": "Imagination has no standards, play has no answers, and sometimes absurd truths hold the greatest truths.",

        // Project 2: 서산의료원 신관
        "충남 서북부 지역의 공공의료 중심지의 역할을 강화하고 지역 사회 변화에 유연하게 대응하는 새로운 공공의료시설이다. 기존 의료원과 지역사회를 연결하는 열린 마당을 만들고 기존 시설을 재구성했다. '분리·연결·지속'을 원칙으로 기능을 분산시키고 연결하여 지속 가능한 의료환경을 구축하고 친환경 옥외공간은 환자와 방문자에게 열린 의료 환경을 제공한다.": "This is a new public medical facility that strengthens the role of the public healthcare hub in the northwestern region of Chungcheongnam Province and flexibly responds to community changes. We created an open courtyard connecting the existing medical center with the local community and reorganized existing facilities. Following the principles of 'separate, connect, and sustain,' we dispersed and connected functions to build a sustainable medical environment, and eco-friendly outdoor spaces provide an open medical environment for patients and visitors.",

        // Project 3: 수원역 일대 마스터플랜
        "'신수원'은 녹음이 풍부한 도시 환경 위에 다양한 사람들의 일상과 활동이 자연스럽게 스며들 수 있도록 구성된 정원 도시의 개념이다. 네 개의 테마 지구는 각기 다른 기능과 스카이라인을 가지면서도 하나의 통일된 도시 디자인 언어로 연결되어 있으며 그 중심에는 사람 중심의 열린 공간, 보행 중심의 흐름, 그리고 도심 속 자연이 공존한다. 이를 통해 수원역 일대는 그린 스마트시티이자 정원의 도시, 다시 말해 '신수원: 新 秀原'이라는 새로운 도시 정체성을 구현하게 된다.": "'New Suwon' is a garden city concept where diverse people's daily lives and activities can naturally permeate a green urban environment. The four themed districts each have different functions and skylines, yet are connected by a unified urban design language. At the center are people-centered open spaces, pedestrian-focused flows, and nature within the city coexisting. Through this, the area around Suwon Station realizes a new urban identity as a green smart city and garden city, namely 'New Suwon: 新秀原'.",

        // Project 4: 남양주왕숙 B-5BL
        "남양주왕숙 B-5BL 설계 프로젝트입니다.,.": "This is the Namyangju Wangsuk B-5BL design project.",

        // Project 5: 원익 홀딩스 강남 사옥
        "공간 구성은 명확하다. 저층부는 도시와 공유되는 공용 영역으로 열리고, 상층부는 효율적인 업무 환경에 집중한다. 정형화된 업무 평면은 임대와 운영의 유연성을 확보하며, 기업 활동의 지속 가능성을 뒷받침한다.": "The spatial composition is clear. The lower floors open as common areas shared with the city, while the upper floors focus on an efficient work environment. The standardized office floor plan ensures flexibility in leasing and operation, supporting the sustainability of corporate activities.",
        "최소한으로 계획된 조경과 공개공지는 도심 속에서 과도한 제스처 없이 건물의 존재감을 드러낸다. 원익홀딩스 사옥은 기업의 정체성을 도시 구조 안에 조용하지만 분명하게 새기는 업무시설로 완성된다.": "The minimally planned landscaping and public open space reveal the building's presence in the city center without excessive gestures. Wonik Holdings office building is completed as a workplace facility that quietly yet clearly inscribes the company's identity within the urban structure.",
        "원익홀딩스 사옥은 강남대로라는 도시의 전면과 주거지 이면부가 만나는 경계에 자리한다. 대지의 이중적인 성격을 적극적으로 해석하며 고밀도 업무시설이 도시와 관계 맺는 방식을 공개공지와 필로티를 통해 재정의했다. 보행자는 강남대로에서 자연스럽게 건물 하부를 통과하며 이면부로 흐르듯 이어지고, 이 과정에서 업무시설의 경계는 완화된다. 필로티 하부는 진입 공간이자 도시 흐름을 흡수하는 완충 지대로 작동한다.": "Wonik Holdings office building is located at the boundary where Gangnam-daero, the city's frontage, meets the residential backside. Actively interpreting the site's dual character, it redefines how high-density office facilities relate to the city through public open space and pilotis. Pedestrians naturally pass through the building's lower level from Gangnam-daero, flowing to the backside, and in this process, the boundaries of the office facility are softened. The pilotis area functions as both an entrance space and a buffer zone that absorbs urban flow.",

        // Project 6: 구지복합문화센터
        "배치는 전면 보행축인 '어반 코리더'를 중심으로 구성된다. 이 보행 축은 도시에서 공원으로 이어지는 흐름을 건축 내부로 끌어들이며, 로비와 계단, 보이드를 따라 프로그램을 연속적으로 연결한다.": "The layout is organized around the 'Urban Corridor,' a frontal pedestrian axis. This pedestrian axis draws the flow from the city to the park into the building's interior, continuously connecting programs along the lobby, stairs, and void.",
        "두 개의 매스 사이에 형성된 마당은 이동과 체류가 동시에 이루어지는 공간으로 이용자들의 자연스러운 만남과 활동을유도한다. \n외부 녹지와 내부는 입면과 조경을 통해 유기적으로 연결된다.": "The courtyard formed between the two masses is a space where movement and stay occur simultaneously, encouraging users' natural encounters and activities. The external greenery and interior are organically connected through the facade and landscaping.",
        "어린이 놀이시설, 북카페, 수영장, 다목적 홀로 구성된 내부 프로그램은 세대와 활동이 교차하는 구조로 배치되었다.": "The internal program, consisting of children's play facilities, book cafe, swimming pool, and multipurpose hall, is arranged in a structure where generations and activities intersect.",
        "각 공간은 외부 경관과의 시각적 관계를 고려해 계획되며, 단면에서는 다양한 레벨과 보이드가 공용 영역을 관통해 열린 공간 경험을 만든다.\n구지 복합문화센터는 공원 속 하나의 오브제이자, 지역의 일상과 문화를 잇는 새로운 도시적 장치로 제안된다.": "Each space is planned considering the visual relationship with the external landscape, and in section, various levels and voids penetrate the common areas to create an open spatial experience. The Guji Multi-Cultural Center is proposed as an object within the park and a new urban device connecting the region's daily life and culture.",
        "젊은 세대 유입이 활발한 지역적 배경을 바탕으로, 단일 프로그램이 아닌 다양한 활동을 수용하는 복합 문화 플랫폼으로 계획되었다.": "Based on the regional background of active young generation influx, it was planned as a multi-cultural platform accommodating diverse activities rather than a single program.",
        "구지 복합문화센터는 산업단지와 주거지, 공원이 맞닿은 구지 지역의 도시 구조 속에서\n분절된 일상과 기능을 통합하는 공공문화시설이다.": "The Guji Multi-Cultural Center is a public cultural facility that integrates fragmented daily life and functions within the urban structure of the Guji area where industrial complexes, residential areas, and parks meet.",
        "건물은 도로와의 관계를 명확히 하면서도 공원의 흐름을 적극적으로 수용해, 도시와 자연을 연결하는 새로운 공공 거점을 형성한다.": "While clarifying its relationship with the road, the building actively accommodates the park's flow, forming a new public hub connecting the city and nature.",

        // Project 7: 환동해 블루카본센터
        "환동해 블루카본센터 설계 프로젝트입니다": "This is the East Sea Blue Carbon Center design project.",
        "환동해 블루카본센터 설계 프로젝트입니다환동해 블루카본센터 설계 프로젝트입니다": "This is the East Sea Blue Carbon Center design project.",

        // Project 8: 신림동 복합청사
        "도시의 다양한 스케일이 공존하는 별빛 거리 중심의 신림동 복합청사는 주민과 도시를 연결하는 열린 복합문화공간이다. \n작고 조밀한 도시 구조를 가지는 별빛 거리의 맥락을 받아들여 복합청사의 입면 매스를 분절하고 수직·수평으로 비워낸 공간은 이용자들의 활동을 드러내며 거리의 활동적인 모습과 맞물려 생동감 있는 도시환경을 조성한다.": "The Sillim-dong Complex Government Office, centered on Byeolbit Street where various urban scales coexist, is an open multi-cultural space connecting residents and the city. Accepting the context of Byeolbit Street with its small and dense urban structure, the segmented facade mass and vertically-horizontally voided spaces reveal users' activities, engaging with the street's active appearance to create a vibrant urban environment.",
        "복합청사 입면의 들이고 내민 모습은 흐름이 되어 별빛 거리의 활동적 모습과 연계해 리듬감을 표현한다.": "The recessed and protruding appearance of the complex government office facade becomes a flow, expressing rhythm in connection with the active appearance of Byeolbit Street.",
        "신림동 복합청사는 별빛 거리의 새로운 입면이 되어 도시의 표정을 다채롭게 하고 다양한 외부공간은 도시의 주머니가 되어 자유롭게 오고 가는 주민들에게 아늑한 커뮤니티 공간이 되어준다.": "The Sillim-dong Complex Government Office becomes a new facade of Byeolbit Street, enriching the city's expression, and various external spaces become urban pockets, providing cozy community spaces for residents coming and going freely.",

        // Project 9: 중곡동 공영주차장
        "중곡동의 오픈스페이스로 남아있던 삼각형의 대지는 각 면이 서로 다른 지면 레벨과 도시 구조로 둘러싸여 있다.\n전혀 다른 도시 구조가 만나는 이곳에 중곡동 주민의 문화와 마주침의 기회로 가득한 스트리트형 '커뮤니티 몰'을 제안한다.": "The triangular site that remained as an open space in Junggok-dong is surrounded by different ground levels and urban structures on each side. At this meeting point of entirely different urban structures, we propose a street-type 'Community Mall' filled with opportunities for culture and encounters for Junggok-dong residents.",
        "삼각형 대지에서 세 면으로 열린 길은 지역 주민의 출근길과 하교길이 되어 다채로운 커뮤니티가 된다.": "The paths open to three sides from the triangular site become commuting routes and school routes for local residents, creating a diverse community.",

        // Project 10: 원도심 소상공인 상생주차장  
        "대전 상생주차장 설계 프로젝트입니다.": "This is the Daejeon Shared Parking design project.",
        "배치는 대흥공원의 주요 보행 축과 시각적 연계를 고려해 설정되었다. 주차 진입 동선과 보행 동선을 명확히 분리해 보행자 안전을 최우선으로 확보하고 차량 동선은 단순하고 직관적으로 계획해 교차를 최소화했다.": "The layout was established considering the main pedestrian axis and visual connection with Daeheung Park. Parking entry routes and pedestrian routes are clearly separated to prioritize pedestrian safety, and vehicle circulation is planned simply and intuitively to minimize intersections.",
        "차량과 사람의 동선은 명확히 구분되지만, 보행자의 경험은 공원에서 건물 내부로 자연스럽게 이어진다. 매스는 전통 정자의 이미지를 현대적으로 재해석하며, 머무름과 그늘, 교류라는 정자의 속성을 주차장에 이식한다.": "While vehicle and pedestrian circulation are clearly distinguished, the pedestrian experience naturally extends from the park into the building interior. The mass reinterprets the traditional pavilion image in a modern way, transplanting the attributes of staying, shade, and exchange inherent to pavilions into the parking facility.",
        "상생주차장은 공원과 함께 마을의 공간으로 기능하며 보행 중심의 도시 경험을 확장한다. 건물 내부에는 상생라운지와 같은 공공 프로그램이 배치되어 지역 친화적 네트워크를 형성한다.": "The Shared Parking functions as a community space together with the park, expanding the pedestrian-centered urban experience. Public programs such as the shared lounge are arranged inside the building to form a community-friendly network.",
        "내부는 닫힌 실의 집합이 아닌, 층과 공간이 유기적으로 이어지는 열린 구조로 계획되었다. 메인로비에서 시작된 시선은 북스테어를 따라 확장되고, 높은 층고와 보이드는 쾌적한 독서 환경을 만든다.": "The interior is planned as an open structure where floors and spaces are organically connected, rather than a collection of closed rooms. The view starting from the main lobby extends along the book stairs, and the high ceiling height and void create a comfortable reading environment.",
        "공원에서의 산책과 도서관 내부의 이동은 하나의 Green Corridor로 이어지며, 외부와 내부, 자연과 건축의 경계는 점차 흐려진다. 이는 도시와 자연의 경계에서 새로운 공공적 풍경을 만들어낸다.": "Walking in the park and movement inside the library are connected as one Green Corridor, and the boundaries between exterior and interior, nature and architecture gradually blur. This creates a new public landscape at the boundary between city and nature.",

        // Project 11: 개봉동 종합사회복지관
        "개봉동 사회복지관은 도시의 낡은 직조 사이로 새로운 사회적 안전망을 짜 넣는 작업입니다.": "The Gaebong-dong Community Center is a work of weaving a new social safety net into the city's old fabric.",
        "고령 인구와 청소년이 공존하는 지역적 특성을 고려하여, 서로 다른 세대가 자연스럽게 마주칠 수 있는 층별 보이드와 공용 테라스를 설계의 핵심으로 삼았습니다.": "Considering the regional characteristics where the elderly population and youth coexist, we made floor-by-floor voids and shared terraces where different generations can naturally encounter each other the core of the design.",
        "따뜻한 톤의 노출 콘크리트와 조절된 채광은 공간 전체에 평온함을 부여하며, 지역 사회를 위한 열린 건축의 표본이 됩니다.": "Warm-toned exposed concrete and controlled daylighting impart tranquility to the entire space, becoming an exemplar of open architecture for the local community.",
        "도시의 콘텍스트와 조화를 이루는 주 진입부 전경입니다. 수평적인 선의 흐름을 강조하여 주변 건물들과의 시각적 연속성을 유지했습니다.": "This is the main entrance view harmonizing with the urban context. We emphasized the flow of horizontal lines to maintain visual continuity with surrounding buildings.",
        "수직적 보이드가 만들어내는 풍부한 공간감을 통해 서로 다른 층에서 활동하는 사용자들이 시각적으로 연결되도록 설계했습니다.": "We designed users active on different floors to be visually connected through the rich spatial sense created by the vertical void.",
        "시간에 따라 변화하는 빛의 변주를 내부로 끌어들여, 공간이 매 순간 다른 표정을 가질 수 있도록 의도했습니다.": "We intended to draw in light variations that change over time so that the space can have different expressions at every moment.",
        "사회적 소통이 일어나는 열린 테라스는 지역 주민들이 언제든 머무를 수 있는 도심 속 작은 쉼터가 됩니다.": "The open terrace where social communication occurs becomes a small refuge in the city center where local residents can stay anytime.",
        "따뜻한 질감의 재료와 세밀한 디테일은 방문객들에게 심리적 안정을 주며 공간에 대한 애착을 형성하게 합니다.": "Materials with warm textures and detailed details provide psychological stability to visitors and form attachment to the space.",

        // Project 12: 우이동 교통광장 공영주차장
        "우이동 공영주차장 설계 프로젝트입니다.": "This is the Ui-dong Public Parking Lot design project.",
        "북한산으로 향하는 길목에 자리한 이곳은 오랫동안 스쳐 지나가는 장소로 존재해 왔다. \n교통광장이라는 성격은 이곳을 머무르기보다 일상의 흐름을 가속하는 공간이었고, 자연스럽게 일상과의 접점이 희미해졌다.": "Located at the gateway to Bukhansan Mountain, this place has long existed as a passing-by location. The character of a transportation plaza made it a space that accelerates the flow of daily life rather than a place to stay, and naturally its contact with everyday life faded.",
        "이 프로젝트는 이러한 대지가 다시 지역에 열릴 수 있는 가능성에서 출발한다. 기능적 공간이 공영주차장이라는 공공 프로그램을 통해 지역의 풍경과 삶을 담아낼 수 있을지에 대한 질문이 설계의 출발점이었다.": "This project starts from the possibility that such a site can open to the community again. The starting point of the design was the question of whether a functional space could contain the local landscape and life through the public program of a public parking lot.",

        // Project 13: 웨일스코브 울산
        "웨일스코브 울산 설계 프로젝트입니다.": "This is the Wales Cove Ulsan design project.",

        // Project 14: 시흥 해양레저 클럽하우스
        "남양주왕숙 B-5BL 설계 프로젝트입니다.": "This is the Namyangju Wangsuk B-5BL design project.",
        "세 면이 바다와 접한 특성을 살려 항해하는 배의 모양새로 시화호 마리나베이를 향해 역동적으로 나아가는 모습을 표현했다. 바다와 도시를 연결하는 클럽하우스는 도시와 상호작용하며 바다의 다채로운 풍광을 담는다. 이곳은 사람들로 가득 찬 배이자 그릇(Vessel)이다.": "Taking advantage of characteristics where three sides face the sea, we expressed the appearance of dynamically advancing toward Sihwa Lake Marina Bay in the shape of a sailing vessel. The clubhouse connecting the sea and city interacts with the city and contains the sea's diverse scenery. This is both a ship and a vessel filled with people.",
        "시화방조제의 끊임없이 변화하는 바다와 풍광을 관조하는 풍경을 담는 '그릇'은 해안선과 자연스럽게 마주하며 시화호의 석양과 다양한 풍광을 조망할 수 있는 시화호의 새로운 상징이다.": "The 'vessel' that contemplates and contains the constantly changing sea and scenery of Sihwa Seawall naturally faces the coastline and becomes a new symbol of Sihwa Lake where one can view the sunset and various scenery of Sihwa Lake.",
        "바다의 움직임을 내부 공간으로 형상화한 연회장과 전망 레스토랑을 조성하여 \n시화호에 생기를 불어넣는다.\n1층 컨벤션Ⅱ는 곡선 디자인으로 일체감을 주고 흡음 패브릭이 부드러운 분위기를 만든다.\n2층 컨벤션I은 시화호의 파도를 형상화한 천장과 간접조명으로 은은한 분위기를 연출한다.\n3층 F&B 공간은 바다의 역동적인 파도와 시화호의 파노라마 뷰를 즐길 수 있는 공간이다.": "By creating a banquet hall and observation restaurant that embody the sea's movement as interior space, we breathe vitality into Sihwa Lake. The 1st floor Convention II provides a sense of unity with curved design and sound-absorbing fabric creates a soft atmosphere. The 2nd floor Convention I creates a subtle atmosphere with a ceiling shaped like Sihwa Lake waves and indirect lighting. The 3rd floor F&B space is where one can enjoy the sea's dynamic waves and panoramic views of Sihwa Lake.",

        // Project 15: 대전 보문산 전망타워
        "스테레오 타입을 벗어난 보문산 전망 타워는 첨성대를 현대적 이미지로 재해석해 우주과학의 중심지인 대전을 알리는 신호탄이 되는 새로운 패러다임의 전망 타워이다. 보문산 위에서 대전과 자연을 양방향으로 조망할 뿐만 아니라 하늘을 조망하면서 우주로 향하는 대전의 미래지향적 모습을 상징한다.": "Breaking away from stereotypes, Bomunsan Observatory Tower reinterprets Cheomseongdae in a modern image, becoming a new paradigm observation tower that serves as a signal announcing Daejeon as the center of space science. It not only offers bidirectional views of Daejeon and nature from Bomunsan Mountain but also symbolizes Daejeon's future-oriented image toward space while viewing the sky.",
        "보문산 전망 타워는 그 자체로 전망의 공간이자 조망 대상이 되어 도시의 배경이자 경관으로 기능한다. \n액자를 닮은 전망 타워는 도시의 시간과 자연의 흐름을 기록한다.": "Bomunsan Observatory Tower itself becomes a space for observation and an object to be observed, functioning as both the city's background and landscape. The observation tower resembling a frame records the city's time and nature's flow.",
        "도시와 자연을 담는 액자가 되는 전망 타워는\n두 개의 코어가 만들어 낸 타워 프레임 속에\n보문산의 사계와 대전 도심을,\n하늘을 향해 열린 프레임은 별과 우주를 담아낸다.": "The observation tower becoming a frame containing the city and nature, within the tower frame created by two cores, captures the four seasons of Bomunsan and downtown Daejeon, and the frame open to the sky contains stars and the universe.",

        // Project 16: 제물포 Station-J
        "\"과거와 미래가 공존하는 제물포의 새로운 광장\"": "\"Jemulpo's new plaza where past and future coexist\"",
        "역사와 이야기가 가득한 제물포역 북광장은 '비움'을 통해 모두가 쉬고, 걷고, 이야기할 수 있는 도심 속 광장이 된다. 과거의 흔적을 들어 올린 입체적 공간 구조의 아래는 광장이 되고 위는 기억을 잇는 플랫폼으로 구성된다.": "Jemulpo Station North Plaza, filled with history and stories, becomes a plaza in the city center where everyone can rest, walk, and talk through 'emptying.' The three-dimensional spatial structure that lifts traces of the past has a plaza below and a platform connecting memories above.",

        // Project 17: 호남선 목포역
        "목포 스퀘어, 목포 원도심의 새로운 중심 공간": "Mokpo Square, the new central space of Mokpo's old downtown",
        "도시와 호흡하며 새로운 목포의 마중물이 되는 목포 스퀘어는 목포역으로 단절되었던 남해지구와 원도심을 연결하여 사람들이 쉽게 모이는 중심 공간이다. 목포스퀘어는 목포 앞바다와 삼학도, 유달산을 조망하는 가고 싶은 역사, 머무르고 싶은 역사로 거듭나 향후 목포시 발전의 새로운 이정표로써 활용될 것이다.": "Breathing with the city and becoming a priming water for new Mokpo, Mokpo Square is a central space where people easily gather, connecting Namhae District and the old downtown that were separated by Mokpo Station. Mokpo Square will be reborn as a station people want to visit and stay at, overlooking Mokpo's coastal waters, Samhakdo, and Yudalsan, and will be utilized as a new milestone for Mokpo city's future development.",

        // Project 18: 이인중학교
        "이인중학교 설계 프로젝트입니다.": "This is the Iin Middle School design project.",
        "보행과 차량 동선을 명확히 분리한 안전한 통학 환경, 지역에 개방된 체육시설과 공용 공간은 학교를 지역사회와 연결하는 열린 교육 플랫폼으로 완성한다. 이인중학교는 지형과 자연, 학습과 커뮤니티가 함께 성장하는 공간이다.": "A safe commuting environment with clearly separated pedestrian and vehicle circulation, sports facilities and communal spaces open to the community complete the school as an open educational platform connecting with the local community. Iin Middle School is a space where topography and nature, learning and community grow together.",
        "이인중학교는 경사진 대지 위 '배움이 피어나는 과정'을 공간으로 풀어낸 학교다. 교과교실의 남향 배치를 극대화한 배치를 통해 쾌적한 교육환경을 가진다. 고저차에 따라 3단으로 나뉜 외부 공간은 운동장, 진입광장, 학교숲이 이어지는 캠퍼스는 학생들의 일상을 자연스럽게 수용한다.": "Iin Middle School is a school that unfolds 'the process of learning blossoming' as space on a sloped site. Through a layout that maximizes south-facing placement of classrooms, it has acomfortable educational environment. The outdoor space divided into three levels according to elevation differences, with playground, entrance plaza, and school forest connected, naturally accommodates students' daily lives.",

        // Project 19: 호매실 체육센터
        "호매실 체육센터 설계 프로젝트입니다.": "This is the Homaesil Sports Center design project.",

        // Project 20: 화천형 보금자리 조성사업
        "화천형 보금자리 조성사업 설계 프로젝트입니다.": "This is the Hwacheon Public Housing Project design project.",

        // Project 21: 속초교육문화관
        "옛 서원 누각을 현대적으로 재해석한 속초교육문화관은 속초의 자연경관을 감상하며 풍류를 즐기고 쉬면서 지식을 배우는 문화교류의 장이다.": "Sokcho Education and Culture Center, which reinterprets the old Seowon pavilion in a modern way, is a place of cultural exchange where one can enjoy elegance while appreciating Sokcho's natural scenery, rest, and learn knowledge.",
        "경사지를 활용해 도시의 흐름을 대지로 끌어들이고, 도심 속 새로운 휴식처를 제공한다. 교육문화관과 연계된\n후정은 소음에서 차단된 쾌적한 독서 공간을 제공하며 열린 광장 조성으로 지역의 다양한 이벤트를 수용하는 복합문화관이 된다.": "Utilizing the slope to draw the city's flow into the site and providing a new resting place in the city center. The rear garden connected to the Education and Culture Center provides a comfortable reading space isolated from noise, and by creating an open plaza, it becomes a multi-cultural center accommodating various regional events.",

        // Project 22: 시흥1동 시·구유 공영주차장
        "커뮤니티와 함께하는 공영주차장은 기존의 조밀하고 작은, 낙후된 구도심의 어두운 이미지를 쇄신하고 무채색의 도시에 생기를 불어넣는 '어반 아코디언'을 모티프로 구현했다. 도시에 활력을 불어넣는 입면은 작은 도시스케일에 대응하며 아코디언의 역동적인 사선을 추가해 발랄하고 유쾌한 도시경관을 연출한다.": "The public parking lot together with the community is implemented with the motif of 'Urban Accordion' that refreshes the dark image of the existing dense, small, and deteriorated old downtown and breathes vitality into the achromatic city. The facade that breathes vitality into the city corresponds to the small urban scale and adds the accordion's dynamic diagonal lines to create a lively and cheerful urban landscape.",
        "주민들의 사랑방이 되는 편의시설, 전통시장과 연계한 상인회 사무실, 이벤트 공간으로 활용 가능한 루프탑은 지역사회에 활기를 불어넣는다.": "Convenience facilities that become residents' gathering places, merchant association offices linked with traditional markets, and rooftops that can be used as event spaces breathe vitality into the local community.",

        // Project 23: 천연물소재 전주기 표준화 허브
        "천연물 산업의 개발부터 제품화, 인증까지 원스톱 서비스를 제공하는 거점으로 미래 혁신의 출발점이자 성장과 도약의 기반이 된다. 천연물 소재 전주기 표준화를 위한 인프라와 기술지원, 안정적 원료 공급 체계를 구축해 산업 생태계 선순환과 서비스 확산을 주도하는 중심 역할을 한다.": "As a hub providing one-stop service from development to commercialization and certification of the natural materials industry, it becomes the starting point for future innovation and the foundation for growth and leap forward. It plays a central role in leading the virtuous cycle of the industrial ecosystem and service expansion by establishing infrastructure and technical support for natural materials whole-cycle standardization and a stable raw material supply system.",
        "건물의 중앙을 관통하는 투명한 유리는 개방성과 소통을, 수평적으로 쌓아 올린 구조는 지식과 연구의 축적을 상징한다.\n곡선과 직선을 엮은 입면 디자인은 자연과 기술의 융합을 상징하며 미래지향적 비전을 시각화하고 있다.": "The transparent glass penetrating the center of the building symbolizes openness and communication, and the horizontally stacked structure symbolizes the accumulation of knowledge and research. The facade design weaving curves and straight lines symbolizes the fusion of nature and technology and visualizes a future-oriented vision.",

        // Project 24: 비슬도서관
        "비슬도서관은 달성의 중심에 놓였으나 오랫동안 도시의 흐름에서 비켜서 있던 포산공원의 풍경으로부터 출발한다. 나무는 자랐지만 사람의 발걸음이 드물었던 이 공원은 아름다움에도 불구하고 도시의 일상과 느슨하게 단절된 장소였다.": "Biseul Library starts from the landscape of Posan Park, which was placed in the center of Dalseong but had long stood aside from the city's flow. This park, where trees grew but human footsteps were rare, was a place loosely disconnected from the city's daily life despite its beauty.",
        "비슬도서관은 이 잊혀진 풍경 위에 새로이 개입하기보다, 사람과 도시, 자연을 다시 연결하는 매개로서 공원의 시간을 확장한다. 단순히 책을 읽는 장소를 넘어, 공원과 도시가 마주하며 새로운 관계를 만들어내는 공공의 장으로 이곳을 재해석했다": "Rather than newly intervening on this forgotten landscape, Biseul Library extends the park's time as a medium reconnecting people, city, and nature. Beyond simply being a place to read books, we reinterpreted this place as a public space where the park and city face each other and create new relationships.",

        // Project 25: 홍릉 첨단의료기기개발센터
        "홍릉 연구개발특구의 거점이 될 첨단의료기기 개발센터 및 바이오헬스 센터는 지역 주민들에게 열린 공공공간과 건강 증진 프로그램을 제공한다. 또한, 주민들이 즐겨 이용하는 선형공원과 정릉천 사이를 유연하게 연결해 공원의 맥락을 더욱 긴밀하게 한다. 편안하고 쾌적한 환경이 보장되어야 하는 연구원들의 업무 환경은 주변 소음에서 벗어나, 천장산과 수목원 등 인근 녹색환경과 호흡하게 한다.": "The Advanced Medical Device Development Center and BioHealth Center, which will become the hub of Hongneung R&D Special Zone, provides public spaces and health promotion programs open to local residents. It also flexibly connects the linear park and Jeongneungcheon Stream frequently used by residents, making the park's context more intimate. The work environment for researchers, which must ensure a comfortable and pleasant environment, escapes from surrounding noise and breathes with nearby green environments such as Cheonjangsan Mountain and the arboretum.",
        "주변 교육시설의 인프라와 함께 시너지를 이루고, 지역사회와 호흡하며, 쾌적하고 창의적인 공간환경을 제공하는 바이오 헬스 센터의 새로운 패러다임이다.": "It is a new paradigm of a biohealth center that synergizes with surrounding educational facilities' infrastructure, breathes with the local community, and provides a comfortable and creative spatial environment.",

        // Project 26: 경기지방정원 방문자센터
        "우리가 생각한 방문자센터는 자연 속에 녹아들되 건축물이 두드러지지 않아야 한다. 대상지는 경기 정원의 시작과 끝을 아우르는 곳에서 정원 전체는 물론 인근 습지 공원들과도 연계되는 중심적 공간이다.": "The visitor center we envisioned should blend into nature without the building standing out. The site is a central space that encompasses the beginning and end of Gyeonggi Garden and is linked not only to the entire garden but also to nearby wetland parks.",
        "본 건물은 긴 동선을유연하게 연결하며 정원 초입의 시작을 알리면서 분위기 전환과 방문객의 자연스러운 유입을 유도한다. 경기지방정원과 연계된 다양한 체험학습 프로그램은 사람들의 참여를 이끌어내며 정원문화 확산에 기여한다.": "This building flexibly connects long circulation routes and announces the start of the garden entrance while guiding atmosphere transition and natural visitor inflow. Various experiential learning programs linked with Gyeonggi Regional Garden draw people's participation and contribute to the spread of garden culture.",

        // Project 27: 대림2동 공공복합청사
        "도시와 조화되는 담백한 모습으로 가로의 혼잡함을 순화시키고 주민에게 열린 공간을 제공하는 대림2동 주민센터는 도시의 거실이자 도시의 복도로 기능하며 유아부터 장년까지 모든 세대가 일상을 공유하는 커뮤니티가 된다. 이곳은 대림동과 어울리는 조화로운 공공청사로서 사람들이 모이는 마을의 쉼터, 세대를 아우르는 커뮤니티 복합체가 된다.": "With a simple appearance harmonizing with the city, the Daerim 2-dong Community Center softens street congestion and provides open space to residents, functioning as the city's living room and corridor, becoming a community where all generations from infants to seniors share daily life. This becomes a harmonious public office building suited to Daerim-dong, a village refuge where people gather, and a community complex encompassing generations.",
        "대림동의 작은 골목과 볼륨이 주는 스케일을 존중하며 도시의 스케일과 조화를 이루며 정갈하게 대상지에 자리 잡는다. 혼잡한 전면도로와 주거밀집단지 사이에 위치한 열린 마당은 마을을 향해 열린 도시의 거실로 기능하며 대림동의 새로운 거리 환경을 조성하는 솔루션이다.": "Respecting the scale given by Daerim-dong's small alleys and volume, it harmonizes with the city's scale and sits neatly on the site. The open courtyard located between the congested front road and densely populated residential complex functions as the city's living room open to the village and is a solution creating Daerim-dong's new street environment.",

        // Project 28-29: No text content found in database

        // Project 30: 충북 영동 관광안내센터
        "저층부는 일상의 교류를 촉진하는 모두에게 열린 광장으로, 상층부는 수직으로 솟아올라 사람들의 호기심과 시선을 유도한다. 두 부분을 이어주는 중심부는 다채로운 행사가 펼쳐지는 열린 플랫폼이 되어 1년 365일 늘 사람들로 북적이는 \"웰컴 센터\"가 된다.": "The lower level is an open plaza for everyone that promotes daily exchange, while the upper level rises vertically to guide people's curiosity and gaze. The central part connecting the two sections becomes an open platform where diverse events unfold, becoming a 'Welcome Center' always bustling with people 365 days a year.",
        "도로에 면한 오픈형 라운지에서는 다양한 이벤트와 축제가 펼쳐진다. 이 특정 축제 시기에만 활용되는 관광 안내 시설이 아닌 일상이 축제가 되는 공간으로 지역 주민, 관광객, 직원 모두를 위한 \"열린 커뮤니티 라운지\"이다.": "Various events and festivals unfold in the open-type lounge facing the road. This is not a tourist information facility used only during specific festival periods, but an 'open community lounge' for local residents, tourists, and staff where daily life becomes a festival.",

        // Project 31: No text content

        // Project 32: 제주해양치유센터
        "제주 해양치유센터는 해안도로와 공원, 바다라는 조건 위에서 치유 프로그램의 집중도와 관광 인지성을 함께 고려한 시설이다. '붉은오름'이라는 개념은 제주의 오름에서 착안한 사선형 매스와 지붕으로 구현되며, 해안도로를 따라 이동하는 방문객에게 명확한 공간적 인상을 남긴다.": "Jeju Marine Healing Center is a facility that considers both the concentration of healing programs and tourism recognition under the conditions of coastal roads, parks, and the sea. The concept of 'Red Oreum' is implemented as a diagonal mass and roof inspired by Jeju's oreum, leaving a clear spatial impression on visitors moving along the coastal road.",
        "제주 해양치유센터는 오름의 형상을 차용한 지붕 아래, 치유를 위한 명확한 질서와 시퀀스를 구축한다. 과도한 제스처보다는 풍경과 프로그램의 관계를 정제해, 제주의 자연을 배경으로 작동하는 공공 치유시설이다.": "Jeju Marine Healing Center establishes a clear order and sequence for healing under the roof borrowed from the oreum's form. Rather than excessive gestures, it refines the relationship between landscape and program, operating as a public healing facility against the backdrop of Jeju's nature.",
        "접근 체계는 차량 이용 비중이 높은 조건을 반영하여 계획되었다. 주차장은 대지 후면에 배치되고, 방문자는 녹지 공간을 따라 이동하며 건물 전면에 도달한다. 차량과 보행 동선은 분리되어 있으며, 드롭오프 존을 통해 접근 시퀀스의 질을 높인다. 전면부는 입체적인 매스로 구성되어 해안도로변에서의 인지성을 확보한다.": "The access system was planned reflecting conditions where vehicle use is high. Parking is arranged at the rear of the site, and visitors move along green spaces to reach the building front. Vehicle and pedestrian circulation are separated, and the quality of access sequence is enhanced through a drop-off zone. The front is composed of three-dimensional mass to secure recognition from the coastal road.",
        "외부 공간은 마을형 배치 개념을 적용해 여러 개의 마당과 녹지 공간으로 구성된다.": "The external space is composed of several courtyards and green spaces by applying a village-type layout concept.",
        "치유 프로그램은 단순하고 명확한 조닝을 기반으로 구성된다. 1층에는 독립적인 케어 공간을, 2층에는 주요 치유 프로그램을 배치하여 동선의 혼선을 줄인다. 주요 치유 공간은 한 층 들어 올려 바다와 하늘을 직접 마주하도록 계획되며, 각 프로그램은 빛과 조망, 공간의 깊이를 통해 차별화된 치유 경험을 제공한다.": "The healing program is organized based on simple and clear zoning. Independent care spaces on the 1st floor and main healing programs on the 2nd floor reduce circulation confusion. The main healing spaces are planned to be raised one floor to directly face the sea and sky, and each program provides a differentiated healing experience through light, views, and spatial depth.",

        // Project 33: 쌍문1동 공공복합청사
        "\"모두의 그라운드\": 공공 복합청사는 모두가 목적성 없이 오갈 수 있는 통과하는 누구에게나 열려있다.": "\"Everyone's Ground\": The public complex center is open to everyone who can come and go without purpose.",
        "마을의 초입에 거대한 청사가 들어선다면 자칫 도시 구조가 닫힐 우려가 있다. 건축, 길, 마당이 통합되어 도시 구조를 잇는 사잇공간으로 도시 구조를 잇고 열린 청사의 이미지를 구축했다. 10m 폭으로 마을을 향해 열린 사잇공간은 복합화된 기능의 경계이자 구도심과의 스케일을 존중하는 골목이고 커뮤니티가 촉발되는 마당이다.": "If a huge government building enters the village entrance, there is a risk that the urban structure might close. Architecture, roads, and courtyards are integrated as an in-between space connecting the urban structure, building an image of an open government office. The in-between space with a 10m width open toward the village is both a boundary of complex functions, an alley respecting the scale with the old downtown, and a courtyard where community is triggered.",

        // Project 34: 철원 다목적 실내체육관
        "\"The Sports Bridge\"는 체육관의 역할을 넘어 주변 시설을 유기적으로 연계한다. 대지의 선형에 순응하여 활기찬 철원의 자연환경을 건축물의 내·외부 공간에 연결하고 주민의 일상과 체육문화를 가깝게 해 도시 활력을 높이는 다목적 체육관이다.": "\"The Sports Bridge\" goes beyond the role of a gymnasium to organically link surrounding facilities. Conforming to the site's linearity, it connects Cheorwon's vibrant natural environment to the building's interior and exterior spaces, bringing residents' daily lives and sports culture closer to enhance urban vitality as a multipurpose gymnasium.",
        "기존의 경사 지형을 훼손하지 않고 낮은 산에 켜켜이 매스를 쌓아 내부 공간이 자연스럽게 숲에 스며들게 하였다.": "Without damaging the existing sloped terrain, masses are stacked layer by layer on the low mountain, allowing the interior space to naturally permeate the forest.",

        // Project 35: 동천안휴게소
        "유연하게 구부러진 선형의 긴 매스는 주차장과 대지를 분리하고 위요된 외부공간을 가진다. 단순히 주차장에서 맞이하는 휴게소가 아닌 숲을 거닐며 자연과 연결되는 프롬나드(Promenade)형 휴게소는 아름다운 동천안의 산세를 즐길 수 있는 다양한 숲과 유기적으로 연결된 자연과 내부 공간에서 아름다운 동천안의 산세를 즐길 수 있다.": "The flexibly curved linear long mass separates the parking lot and the site and has an enclosed external space. Not simply a rest area greeted from a parking lot, this Promenade-type rest area that connects with nature while walking through the forest, organically connected with  various forests where one can enjoy the beautiful mountain scenery of East Cheonan, allows one to enjoy the beautiful mountain scenery of East Cheonan in the interior space connected with nature.",
        "주변의 풍광을 내부와 긴밀하게 연결하여 작지만, 풍부한 내부공간을 연출해 방문객에게 새로운 감각의 휴게소를 선보인다.": "By intimately connecting the surrounding scenery with the interior, it creates a small but rich interior space, presenting visitors with a new sensory rest area."
    };

    return translations[text] || text;
}

async function createFinalBilingualWord() {
    console.log('Creating final bilingual Word document...');

    // Read website content
    const websiteContent = fs.readFileSync('website_content_bilingual.md', 'utf-8');

    // Fetch projects
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Processing ${projects.length} projects...`);

    let projectsMarkdown = '\n\n# Project Details (Bilingual)\n# 프로젝트별 상세 정보 (한영 병기)\n\n---\n\n';

    projects.forEach((project, index) => {
        projectsMarkdown += `## ${index + 1}. ${project.title_en || project.title || 'Untitled'}\n`;
        projectsMarkdown += `## ${index + 1}. ${project.title || project.title_en || '제목없음'}\n\n`;

        if (project.location) {
            projectsMarkdown += `**Location:** ${translateText(project.location)}\n`;
            projectsMarkdown += `**위치:** ${project.location}\n\n`;
        }

        if (project.category) {
            const cats = Array.isArray(project.category) ? project.category.join(', ') : project.category;
            projectsMarkdown += `**Category / 카테고리:** ${cats}\n\n`;
        }

        if (project.year) {
            projectsMarkdown += `**Year / 연도:** ${project.year}\n\n`;
        }

        if (project.facts && Array.isArray(project.facts)) {
            projectsMarkdown += `**Project Information / 프로젝트 정보:**\n`;
            project.facts.forEach(fact => {
                if (fact.label && fact.value) {
                    let labelEn = fact.label;
                    if (fact.label === '면적') labelEn = 'Area';
                    else if (fact.label === '규모') labelEn = 'Scale';
                    else if (fact.label === '위치') labelEn = 'Location';
                    projectsMarkdown += `- ${labelEn} / ${fact.label}: ${fact.value}\n`;
                }
            });
            projectsMarkdown += '\n';
        }

        // Text blocks - excluding images
        if (project.blocks && Array.isArray(project.blocks)) {
            const textBlocks = project.blocks.filter(b => b.type === 'text' && b.content?.text);

            if (textBlocks.length > 0) {
                projectsMarkdown += `**Project Description / 프로젝트 설명:**\n\n`;

                textBlocks.forEach(block => {
                    const korText = block.content.text.trim();
                    const engText = translateText(korText);

                    projectsMarkdown += `**English:**\n${engText}\n\n`;
                    projectsMarkdown += `**한글:**\n${korText}\n\n`;
                });
            }
        }

        projectsMarkdown += '---\n\n';
    });

    // Combine all content
    const fullContent = websiteContent + projectsMarkdown;

    // Save as markdown
    fs.writeFileSync('complete_bilingual_content.md', fullContent, 'utf-8');
    console.log('Created complete_bilingual_content.md');

    // Create Word document
    const lines = fullContent.split('\n');
    const paragraphs = [];

    for (let line of lines) {
        if (line.trim() === '') {
            paragraphs.push(new Paragraph({ text: '' }));
        } else if (line.startsWith('# ')) {
            paragraphs.push(new Paragraph({
                text: line.replace('# ', ''),
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
            }));
        } else if (line.startsWith('## ')) {
            paragraphs.push(new Paragraph({
                text: line.replace('## ', ''),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 150 }
            }));
        } else if (line.startsWith('### ')) {
            paragraphs.push(new Paragraph({
                text: line.replace('### ', ''),
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 }
            }));
        } else if (line.startsWith('#### ')) {
            paragraphs.push(new Paragraph({
                text: line.replace('#### ', ''),
                heading: HeadingLevel.HEADING_4,
                spacing: { before: 150, after: 100 }
            }));
        } else if (line.trim() === '---') {
            paragraphs.push(new Paragraph({
                text: '─────────────────────────────────────────────',
                spacing: { before: 200, after: 200 }
            }));
        } else if (line.startsWith('- ')) {
            paragraphs.push(new Paragraph({
                text: line.replace('- ', ''),
                bullet: { level: 0 }
            }));
        } else if (line.includes('**')) {
            const parts = line.split('**');
            const runs = [];
            for (let j = 0; j < parts.length; j++) {
                if (j % 2 === 1) {
                    runs.push(new TextRun({ text: parts[j], bold: true }));
                } else {
                    runs.push(new TextRun({ text: parts[j] }));
                }
            }
            paragraphs.push(new Paragraph({ children: runs }));
        } else {
            paragraphs.push(new Paragraph({ text: line }));
        }
    }

    const doc = new Document({
        sections: [{ properties: {}, children: paragraphs }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync('SEOP_완전한영병기.docx', buffer);

    console.log('\n✅ Successfully created SEOP_완전한영병기.docx');
    console.log('📄 Also created complete_bilingual_content.md for reference');
}

createFinalBilingualWord().catch(console.error);
