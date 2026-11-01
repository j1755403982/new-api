import React, { useContext, useEffect, useState } from 'react';
import { marked } from 'marked';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API, getSystemName, showError, showNotice } from '../../helpers';
import { StatusContext } from '../../context/Status';
import { UserContext } from '../../context/User';

const Home = () => {
  const { t } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [userState] = useContext(UserContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeHtml, setNoticeHtml] = useState('');
  const [aboutHtml, setAboutHtml] = useState('');

  const systemName = getSystemName();
  const status = statusState?.status || {};
  const serverAddr = status.server_address || '';
  const origin =
    serverAddr && !/localhost|127\.0\.0\.1/.test(serverAddr)
      ? serverAddr
      : window.location.origin;
  const baseUrl = origin + '/v1';

  const displayNotice = async () => {
    const res = await API.get('/api/notice');
    const { success, message, data } = res.data;
    if (success) {
      let oldNotice = localStorage.getItem('notice');
      if (data !== oldNotice && data !== '') {
        showNotice(marked(data), true);
        localStorage.setItem('notice', data);
      }
      if (data) setNoticeHtml(marked(data));
    } else {
      showError(message);
    }
  };

  const loadAbout = async () => {
    const res = await API.get('/api/about');
    const { success, data } = res.data;
    if (success && data) setAboutHtml(marked(data));
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (data && !data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);
    } else {
      showError(message);
      setHomePageContent(t('home.loading_failed'));
    }
    setHomePageContentLoaded(true);
  };

  useEffect(() => {
    displayNotice().then();
    loadAbout();
    displayHomePageContent().then();
  }, []);

  const curlSample = `curl ${baseUrl}/chat/completions \\
  -H "Authorization: Bearer sk-你的令牌" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "你好"}]
  }'`;

  if (!homePageContentLoaded) {
    return null;
  }

  if (homePageContent !== '') {
    return (
      <>
        {homePageContent.startsWith('https://') ? (
          <iframe
            src={homePageContent}
            title='home'
            style={{ width: '100%', height: '100vh', border: 'none' }}
          />
        ) : (
          <div
            style={{ fontSize: 'larger' }}
            dangerouslySetInnerHTML={{ __html: homePageContent }}
          ></div>
        )}
      </>
    );
  }

  return (
    <div className='oa-home'>
      <section className='oa-hero'>
        <p className='oa-kicker'>OPENAI COMPATIBLE · LLM GATEWAY</p>
        <h1 className='oa-hero-title'>
          {systemName}
          <span className='oa-hero-dot'>.</span>
        </h1>
        <p className='oa-hero-sub'>
          统一接入各类大模型，OpenAI 兼容接口，替换 Base URL
          与密钥即可调用。令牌自助管理、额度实时结算、调用逐条可查。
        </p>
        <div className='oa-hero-cta'>
          {userState.user ? (
            <>
              <Link className='oa-btn oa-btn-primary' to='/dashboard'>
                进入控制台
              </Link>
              <Link className='oa-btn' to='/token'>
                管理令牌
              </Link>
            </>
          ) : (
            <>
              <Link className='oa-btn oa-btn-primary' to='/register'>
                立即注册
              </Link>
              <Link className='oa-btn' to='/login'>
                登录
              </Link>
            </>
          )}
        </div>
        <div className='oa-hero-pills'>
          <span className='oa-pill oa-pill-primary'>
            <i className='bolt icon' />
            Base URL&nbsp;&nbsp;{baseUrl}
          </span>
          <span className='oa-pill'>
            <i className='plug icon' />
            OpenAI 兼容
          </span>
          <span className='oa-pill'>
            <i className='shield alternate icon' />
            令牌随时吊销
          </span>
        </div>
      </section>

      {noticeHtml && (
        <section className='oa-notice'>
          <span className='oa-notice-tag'>公告</span>
          <div
            className='oa-notice-body'
            dangerouslySetInnerHTML={{ __html: noticeHtml }}
          ></div>
        </section>
      )}

      <section className='oa-feature-grid'>
        <div className='oa-feature-card'>
          <i className='plug icon' />
          <b>OpenAI 兼容接口</b>
          <p>沿用官方 SDK 与 OpenAI 协议，只替换 Base URL 和密钥，无需改造成本。</p>
        </div>
        <div className='oa-feature-card'>
          <i className='key icon' />
          <b>令牌自助管理</b>
          <p>随时创建、吊销令牌，可限定模型与过期时间，额度独立可控。</p>
        </div>
        <div className='oa-feature-card'>
          <i className='chart line icon' />
          <b>用量与账单透明</b>
          <p>每次调用的 tokens、耗时与费用逐条可查，消耗明细一目了然。</p>
        </div>
        <div className='oa-feature-card'>
          <i className='shield alternate icon' />
          <b>渠道稳定调度</b>
          <p>多上游渠道按权重分发并自动剔除异常，失败重试，保障可用性。</p>
        </div>
      </section>

      <section className='oa-getstarted'>
        <div className='oa-term'>
          <div className='oa-term-bar'>
            <span className='oa-dot-red' />
            <span className='oa-dot-yellow' />
            <span className='oa-dot-green' />
            <span className='oa-term-title'>quickstart.sh</span>
          </div>
          <pre className='oa-term-body'>{curlSample}</pre>
          <div className='oa-term-foot'>
            <span className='oa-term-key'>BASE_URL</span>
            <span className='oa-term-val'>{baseUrl}</span>
          </div>
        </div>
        <div className='oa-steps'>
          <p className='oa-kicker'>GET STARTED</p>
          <h2 className='oa-section-title'>三步接入</h2>
          <ol className='oa-step-list'>
            <li>
              <span className='oa-step-no'>1</span>
              <div>
                <b>注册账号</b>
                <p>
                  点击右上角注册，完成账号创建后即可登录控制台。
                  {!status.email_verification && ' 当前无需邮箱验证。'}
                </p>
              </div>
            </li>
            <li>
              <span className='oa-step-no'>2</span>
              <div>
                <b>创建令牌</b>
                <p>在「令牌」页面新建密钥，按需设置额度、过期时间与可用模型。</p>
              </div>
            </li>
            <li>
              <span className='oa-step-no'>3</span>
              <div>
                <b>替换 Base URL</b>
                <p>
                  把 SDK 里的地址换成 <code>{baseUrl}</code>，密钥填你的令牌即可。
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {aboutHtml && (
        <section className='oa-panel oa-about'>
          <h3 className='oa-panel-title'>
            关于本站
            <span className='oa-panel-tag'>ABOUT</span>
          </h3>
          <div
            className='oa-about-body'
            dangerouslySetInnerHTML={{ __html: aboutHtml }}
          ></div>
        </section>
      )}

      <section className='oa-cta-band'>
        <div>
          <h3>现在就开始接入</h3>
          <p>注册后即可创建令牌，OpenAI 兼容接口开箱即用。</p>
        </div>
        <div className='oa-hero-cta'>
          {userState.user ? (
            <Link className='oa-btn oa-btn-primary' to='/token'>
              创建令牌
            </Link>
          ) : (
            <Link className='oa-btn oa-btn-primary' to='/register'>
              免费注册
            </Link>
          )}
          <Link className='oa-btn' to='/about'>
            了解更多
          </Link>
        </div>
      </section>

      <p className='oa-home-foot'>
        <span className='oa-dot' /> {systemName} · OpenAI 兼容 · 数据仅存于本站
      </p>
    </div>
  );
};

export default Home;
