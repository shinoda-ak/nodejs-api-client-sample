FROM node:alpine
COPY ./ ./
RUN npm install
CMD ["run.sh"]