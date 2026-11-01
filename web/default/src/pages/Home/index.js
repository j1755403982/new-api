import React, { useContext, useEffect, useState } from 'react';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  API,
  getSystemName,
  showError,
  showNotice,
  timestamp2string,
} from '../../helpers';
import { StatusContext } from '../../context/Status';
import { UserContext } from '../../context/User';

const Home = () => {
  const { t } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [userState] = useContext(UserContext);

  const systemName = getSystemName();

  const displayNotice = async () => {
    const res = await API.get('/api/notice');
    const { success, message, data } = res.data;
    if (success) {
      let oldNotice = localStorage.getItem('notice');
      if (data !== oldNotice && data !== '') {
        const htmlNotice = marked(data);
        showNotice(htmlNotice, true);
        localStorage.setItem('notice', data);
      }
    } else {
      showError(message);
    }
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

  const getStartTimeString = () => {
    const timestamp = statusState?.status?.start_time;
    return timestamp2string(timestamp);
  };

  useEffect(() => {
    displayNotice().then();
    displayHomePageContent().then();
  }, []);

  const version = statusState?.status?.version || '—';
  const startTime = getStartTimeString();
  const baseUrl = `${window.location.origin}/v1`;
  const enabled = (v) =>
    v
      ? t('home.system_status.config.enabled')
      : t('home.system_status.config.disabled');

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
        <p className='oa-kicker'>ONE API · OPENAI COMPATIBLE</p>
        <h1 className='oa-hero-title'>{systemName}</h1>
        <p className='oa-hero-sub'>
          统一接入 OpenAI 兼容的各类大模型接口，替换 Base URL
          即可调用；渠道、令牌、额度与消费记录集中管理。
        </p>
        <div className='oa-hero-pills'>
          <span className='oa-pill oa-pill-primary'>
            <i className='bolt icon' />
            Base URL&nbsp;&nbsp;{baseUrl}
          </span>
          <span className='oa-pill'>
            <i className='plug icon' />
            OpenAI 兼容接口
          </span>
          {!userState.user && (
            <span className='oa-pill'>
              <i className='sign in icon' />
              请先登录或注册
            </span>
          )}
        </div>
      </section>

      <section className='oa-stat-grid'>
        <div className='oa-stat-card'>
          <span className='oa-stat-icon'>
            <i className='server icon' />
          </span>
          <div>
            <b>{systemName}</b>
            <span>站点名称</span>
          </div>
        </div>
        <div className='oa-stat-card'>
          <span className='oa-stat-icon'>
            <i className='code branch icon' />
          </span>
          <div>
            <b>{version}</b>
            <span>版本</span>
          </div>
        </div>
        <div className='oa-stat-card'>
          <span className='oa-stat-icon'>
            <i className='clock outline icon' />
          </span>
          <div>
            <b className='oa-mono'>{startTime}</b>
            <span>启动时间</span>
          </div>
        </div>
        <div className='oa-stat-card'>
          <span className='oa-stat-icon'>
            <i className='certificate icon' />
          </span>
          <div>
            <b>MIT</b>
            <span>开源授权</span>
          </div>
        </div>
      </section>

      <section className='oa-two-col'>
        <div className='oa-panel'>
          <h3 className='oa-panel-title'>
            系统信息
            <span className='oa-panel-tag'>SYSTEM</span>
          </h3>
          <ul className='oa-kv'>
            <li>
              <span>名称</span>
              <b>{systemName}</b>
            </li>
            <li>
              <span>版本</span>
              <b className='oa-mono'>{version}</b>
            </li>
            <li>
              <span>源码</span>
              <b>
                <a
                  href='https://github.com/songquanpeng/one-api'
                  target='_blank'
                  rel='noreferrer'
                >
                  GitHub Repository
                </a>
              </b>
            </li>
            <li>
              <span>启动时间</span>
              <b className='oa-mono'>{startTime}</b>
            </li>
          </ul>
        </div>

        <div className='oa-panel'>
          <h3 className='oa-panel-title'>
            登录与验证
            <span className='oa-panel-tag'>AUTH</span>
          </h3>
          <ul className='oa-kv'>
            <li>
              <span>邮箱验证</span>
              <b
                className={
                  statusState?.status?.email_verification ? 'oa-on' : 'oa-off'
                }
              >
                {enabled(statusState?.status?.email_verification)}
              </b>
            </li>
            <li>
              <span>GitHub 登录</span>
              <b
                className={
                  statusState?.status?.github_oauth ? 'oa-on' : 'oa-off'
                }
              >
                {enabled(statusState?.status?.github_oauth)}
              </b>
            </li>
            <li>
              <span>微信登录</span>
              <b
                className={statusState?.status?.wechat_login ? 'oa-on' : 'oa-off'}
              >
                {enabled(statusState?.status?.wechat_login)}
              </b>
            </li>
            <li>
              <span>Turnstile 校验</span>
              <b
                className={
                  statusState?.status?.turnstile_check ? 'oa-on' : 'oa-off'
                }
              >
                {enabled(statusState?.status?.turnstile_check)}
              </b>
            </li>
          </ul>
        </div>
      </section>

      <p className='oa-home-foot'>
        <span className='oa-dot' /> {systemName} · 自托管 · 数据仅存于本站
      </p>
    </div>
  );
};

export default Home;
