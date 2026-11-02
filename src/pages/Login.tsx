import "../index.css"

export function Login() {
    return (
        <div className="app">
            <h1>Bem Vindo ao BreifForge</h1>
            <h3>Faça login para continuar</h3>
            <div className="form">
                <form action="">
                    <label htmlFor="">
                        <h4>Email:</h4>
                        <input type="email" id="email" placeholder="emai@email.com" />

                        <h4>Senha:</h4>
                        <input type="email" id="email" placeholder="Digite sua senha" />
                        <div className="items-center">
                            <input type="checkbox" id="showpassword" /> <span>Mostrar Senha</span>
                            <input type="checkbox" id="remember" /> <span>Lembrar de mim</span>
                        </div>
                        <button type="submit">Entrar</button>
                        <br />
                        <a href="">Cadastrar</a>
                    </label>
                </form>
            </div>
        </div>
    )
}

export default Login