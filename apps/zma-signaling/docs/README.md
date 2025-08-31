### Running zma-signaling using `pm2` and Nginx

Note:

- Have to open at least 500 ports (more details in application.yaml file)

1. Install NodeJS (sample)
    
    ```bash
    sudo apt-get install -y curl
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    node -v
    ```
    

1. Install `pnpm` and `pm2` using `npm`:
    
    ```bash
    npm install -g pnpm@latest-10
    
    npm install pm2 -g
    ```
    

1. Running zma-signaling: (run from root folder)
    
    ```bash
    pnpm install
    
    # Start mediasup
    cd node_modules/.pnpm/mediasoup@3.18.0/node_modules/mediasoup
    npm run worker:build
    
    # Run zma-signaling using pm2
    pm2 start "npx nx serve zma-signaling" --name zma-signaling
    ```
    

**Nginx:** 

Using docker-compose file and script file in folder `/nginx`