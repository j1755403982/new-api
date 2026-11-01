import React, { useContext, useEffect, useState } from 'react';
import { Form, Image, Modal, Icon } from 'semantic-ui-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/User';
import {
  API,
  getLogo,
  getSystemName,
  showError,
  showSuccess,
  showWarning,
  timestamp2string,
} from '../helpers';
import { onGitHubOAuthClicked, onLarkOAuthClicked } from './utils';
import larkIcon from '../images/lark.svg';

const LoginForm = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    wechat_verification_code: '',
  });
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const { username, password } = inputs;
  const [userState, userDispatch] = useContext(UserContext);
  let navigate = useNavigate();
  const [status, setStatus] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const logo = getLogo();
  const systemName = getSystemName();

  useEffect(() => {
    if (searchParams.get('expired')) {
      showError(t('messages.error.login_expired'));
    }
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
    } else {
      API.get('/api/status')
        .then((res) => {
          if (res.data.success) {
            setStatus(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, []);

  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);

  const onWeChatLoginClicked = () => {
    setShowWeChatLoginModal(true);
  };

  const onSubmitWeChatVerificationCode = async () => {
    const res = await API.get(
      `/api/oauth/wechat?code=${inputs.wechat_verification_code}`
    );
    const { success, message, data } = res.data;
    if (success) {
      userDispatch({ type: 'login', payload: data });
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
      showSuccess(t('messages.success.login'));
      setShowWeChatLoginModal(false);
    } else {
      showError(message);
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setSubmitted(true);
    if (username && password) {
      const res = await API.post(`/api/user/login`, {
        username,
        password,
      });
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        if (username === 'root' && password === '123456') {
          navigate('/user/edit');
          showSuccess(t('messages.success.login'));
          showWarning(t('messages.error.root_password'));
        } else {
          navigate('/token');
          showSuccess(t('messages.success.login'));
        }
      } else {
        showError(message);
      }
    }
  }

  const startRaw = timestamp2string(status.start_time);
  const startTime = (startRaw || '').split(' ')[1] || '—';
  const baseUrl = `${window.location.origin}/v1`;

  return (
    <div className='oa-auth'>
      <aside className='oa-auth-side'>
        <div className='oa-auth-brand'>
          <span className='oa-logo-chip'>
            <img src={logo} alt='logo' />
          </span>
          <div>
            <h1>{systemName}</h1>
            <p>LLM 中转 · OpenAI 兼容</p>
          </div>
        </div>

        <div className='oa-auth-hero'>
          <p className='oa-kicker'>OpenAI Compatible · Self Hosted</p>
          <h2 className='oa-headline'>
            让每一次调用，
            <br />
            都稳妥可控。
          </h2>
          <p className='oa-sub'>
            统一接入 OpenAI 兼容接口，替换 Base URL 即可使用；渠道、令牌、额度与消费记录全部集中管理。
          </p>
        </div>

        <div className='oa-features'>
          <div className='oa-feature'>
            <i className='plug' />
            <div>
              <b>OpenAI 兼容接口</b>
              <p>现有 SDK 只需替换 Base URL 与密钥即可接入，无需改造成本。</p>
            </div>
          </div>
          <div className='oa-feature'>
            <i className='shield alternate' />
            <div>
              <b>密钥随时可吊销</b>
              <p>令牌可随时创建与吊销，模型与分组权限按需授予，止损只需一步。</p>
            </div>
          </div>
          <div className='oa-feature'>
            <i className='chart line' />
            <div>
              <b>逐条计费对账</b>
              <p>每次调用的 tokens 与费用逐条可查，消费明细一目了然。</p>
            </div>
          </div>
        </div>

        <div className='oa-spacer' />

        <div className='oa-terminal'>
          <div>
            POST /v1/chat/completions &nbsp;·&nbsp; <span className='ok'>200 OK</span>
            &nbsp;·&nbsp; stream · sse
          </div>
          <div className='dim' style={{ marginTop: 6 }}>
            BASE_URL&nbsp;&nbsp;{baseUrl}
          </div>
        </div>

        <div className='oa-stats'>
          <div className='oa-stat'>
            <b>{status.version || '—'}</b>
            <span>版本</span>
          </div>
          <div className='oa-stat'>
            <b>{startTime}</b>
            <span>启动时间</span>
          </div>
          <div className='oa-stat'>
            <b>0 条</b>
            <span>占用日志</span>
          </div>
        </div>

        <div className='oa-auth-foot'>
          {systemName} · 自托管部署 · 数据仅存于本站
        </div>
      </aside>

      <main className='oa-auth-main'>
        <div className='oa-auth-card'>
          <div className='oa-tabs'>
            <button type='button' className='oa-tab active'>
              {t('auth.login.title')}
            </button>
            <button
              type='button'
              className='oa-tab'
              onClick={() => navigate('/register')}
            >
              {t('auth.login.register')}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='oa-field'>
              <label>{t('auth.login.username')}</label>
              <div className='oa-input-wrap'>
                <input
                  className='oa-input'
                  name='username'
                  value={username}
                  onChange={handleChange}
                  placeholder={t('auth.login.username')}
                  autoComplete='username'
                />
              </div>
            </div>

            <div className='oa-field'>
              <label>{t('auth.login.password')}</label>
              <div className='oa-input-wrap'>
                <input
                  className='oa-input has-toggle'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handleChange}
                  placeholder={t('auth.login.password')}
                  autoComplete='current-password'
                />
                <button
                  type='button'
                  className='oa-eye'
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label='toggle password'
                >
                  <Icon name={showPassword ? 'eye slash' : 'eye'} />
                </button>
              </div>
            </div>

            <button type='submit' className='oa-submit'>
              {t('auth.login.button')}
            </button>
          </form>

          <div className='oa-links'>
            <span>
              {t('auth.login.forgot_password')}{' '}
              <Link to='/reset'>{t('auth.login.reset_password')}</Link>
            </span>
            <span>
              {t('auth.login.no_account')}{' '}
              <Link to='/register'>{t('auth.login.register')}</Link>
            </span>
          </div>

          {(status.github_oauth ||
            status.wechat_login ||
            status.lark_client_id) && (
            <div className='oa-oauth'>
              {status.github_oauth && (
                <button
                  type='button'
                  className='ui circular button'
                  onClick={() =>
                    onGitHubOAuthClicked(status.github_client_id)
                  }
                >
                  <Icon name='github' />
                </button>
              )}
              {status.wechat_login && (
                <button
                  type='button'
                  className='ui circular button'
                  onClick={onWeChatLoginClicked}
                >
                  <Icon name='wechat' />
                </button>
              )}
              {status.lark_client_id && (
                <button
                  type='button'
                  className='ui circular button'
                  onClick={() => onLarkOAuthClicked(status.lark_client_id)}
                >
                  <Image src={larkIcon} avatar style={{ width: 16, height: 16 }} />
                </button>
              )}
            </div>
          )}

          <p className='oa-legal'>
            登录即代表同意本站服务条款；如忘记密码请联系站点管理员重置。
          </p>
        </div>
      </main>

      <Modal
        onClose={() => setShowWeChatLoginModal(false)}
        onOpen={() => setShowWeChatLoginModal(true)}
        open={showWeChatLoginModal}
        size={'mini'}
      >
        <Modal.Content>
          <Modal.Description>
            <Image src={status.wechat_qrcode} fluid />
            <div style={{ textAlign: 'center' }}>
              <p>{t('auth.login.wechat.scan_tip')}</p>
            </div>
            <Form size='large'>
              <Form.Input
                fluid
                placeholder={t('auth.login.wechat.code_placeholder')}
                name='wechat_verification_code'
                value={inputs.wechat_verification_code}
                onChange={handleChange}
              />
              <button
                type='button'
                className='oa-submit'
                onClick={onSubmitWeChatVerificationCode}
              >
                {t('auth.login.button')}
              </button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    </div>
  );
};

export default LoginForm;
